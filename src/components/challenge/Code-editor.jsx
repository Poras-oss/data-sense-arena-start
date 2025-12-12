import React, { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import { Button } from "@/components/ui/button";
import { useTheme } from '@/lib/theme-context';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Play, Send } from "lucide-react";
import axios from 'axios';
import { useWebSocketContext } from '@/util/WebsocketProvider'


export function CodeEditor({
  subject = 'sql',
  questionData,
  onResultUpdate,
  sendDataToParent,
  hideOutput = false,
  externalOutput,
  externalSetOutput,
  externalError,
  externalSetError,
  externalIsProcessing,
  externalSetIsProcessing,
  onQuestionSolved, // NEW: Callback when question is solved
  currentQuestionIndex = 0, // NEW: Track which question this is
  onSubmitChallenge, // NEW: Handler for Submit Challenge button
  isLastQuestion = false, // NEW: Show Submit Challenge button only on last question
  totalQuestions = 1, // NEW: Total number of questions
  solvedCount = 0 // NEW: Number of solved questions
}) {
  const { theme } = useTheme();
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  // Local state
  const [localOutput, setLocalOutput] = useState(null);
  const [localError, setLocalError] = useState('');
  const [localIsProcessing, setLocalIsProcessing] = useState(false);

  // Use external state if provided, otherwise local
  const output = externalOutput !== undefined ? externalOutput : localOutput;
  const setOutput = externalSetOutput || setLocalOutput;
  const error = externalError !== undefined ? externalError : localError;
  const setError = externalSetError || setLocalError;
  const isProcessing = externalIsProcessing !== undefined ? externalIsProcessing : localIsProcessing;
  const setIsProcessing = externalSetIsProcessing || setLocalIsProcessing;

  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const { socket, isConnected } = useWebSocketContext()


  const handleClick = () => {
    sendDataToParent(true);
  };

  useEffect(() => {
    if (containerRef.current) {
      editorRef.current = monaco.editor.create(containerRef.current, {
        value: questionData?.boilerplate || '',
        language: subject === 'sql' ? 'sql' : 'python',
        theme: theme === 'dark' ? 'vs-dark' : 'vs',
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        lineNumbers: 'on',
        roundedSelection: true,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 16, bottom: 16 }
      });

      return () => {
        editorRef.current?.dispose();
      };
    }
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
    }
  }, [theme]);

  // Update editor content when question changes
  useEffect(() => {
    if (editorRef.current && questionData) {
      // Use setValue to replace the content
      editorRef.current.setValue(questionData.boilerplate || '');
      // Clear previous output/errors when switching questions
      if (externalSetOutput) externalSetOutput(null);
      if (externalSetError) externalSetError('');
    }
  }, [questionData]);

  const handleCodeExecution = async (isSubmission = false) => {
    const code = editorRef.current?.getValue();
    setIsProcessing(true);
    setOutput('');
    setError('');
    setShowFeedback(false);
    setFeedback(null);


    try {
      if (subject === 'sql') {
        await handleSQLExecution(code, isSubmission);
      } else {
        await handlePythonExecution(code, isSubmission);
      }
    } catch (err) {
      setError('Failed to execute code. Please try again.');
      setFeedback({
        type: 'error',
        message: `Error executing code: ${err.message}`
      });
    } finally {
      setIsProcessing(false);
      setShowFeedback(true);
    }
  };

  const handleSQLExecution = async (code, isSubmission) => {

    const response = await axios.get(
      `https://server.datasenseai.com/execute-sql/query?q=${encodeURIComponent(code)}`
      // `http://localhost:4000/execute-sql/query?q=${encodeURIComponent(code)}`
    );
    const result = response.data;

    if (!isSubmission) {
      setOutput(result);
      return;
    }



    const isCorrect = compareResults(result, questionData.expected_output);
    handleSubmissionResult(isCorrect, result);
  };

  const handlePythonExecution = async (code, isSubmission) => {

    if (!isSubmission) {
      // Use Piston API for running code and seeing output
      const combinedCode = questionData.test_cases.map(
        testCase => `print(${testCase.input})`
      ).join('\n');
      const fullCode = `${code}\n${combinedCode}`;
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: 'python',
          version: '3.10',
          files: [{ content: fullCode }]
        })
      });

      const data = await response.json();

      if (data.run) {
        if (data.run.stdout) setOutput(data.run.stdout);
        if (data.run.stderr) setError(data.run.stderr);
      }
      return;
    }

    // For submission, check against test cases
    const allTestCasesPassed = await checkAllTestCases(code, questionData.test_cases);
    handleSubmissionResult(allTestCasesPassed);


  };


  const checkAllTestCases = async (userCode, testCases) => {
    const combinedCode = testCases.map(
      testCase => `print(${testCase.input})`
    ).join('\n');
    const fullCode = `${userCode}\n${combinedCode}`;
    try {
      const response = await axios.post(
        'https://emkc.org/api/v2/piston/execute',
        {
          language: 'python',
          version: '3.10',
          files: [{ name: 'main.py', content: fullCode }]
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const outputs = response.data.run.output.split('\n').map(output => output.trim());
      for (let i = 0; i < testCases.length; i++) {
        if (outputs[i] !== testCases[i].expected_output) {
          // setUserOutput(outputs[i]);
          return false;
        }
      }


      return true;

    } catch (error) {
      console.error('Error executing test cases:', error);

      return false;
    }
  };

  const compareResults = (userResults, expectedOutput) => {
    // Handle error case
    if (userResults.error === true) return false;

    // Get the rows from expected output
    const expectedRows = expectedOutput.rows;

    // Early return if lengths don't match
    if (userResults.length !== expectedRows.length) {
      return false;
    }

    // Convert both result sets to arrays of stringified sorted values
    const expectedRowStrings = expectedRows
      .map(row => JSON.stringify(Object.values(row).sort()))
      .sort();

    const userRowStrings = userResults
      .map(row => JSON.stringify(Object.values(row).sort()))
      .sort();

    // Compare the sorted string arrays
    for (let i = 0; i < expectedRowStrings.length; i++) {
      if (expectedRowStrings[i] !== userRowStrings[i]) {
        return false;
      }
    }

    return true;
  };

  const handleSubmissionResult = (isCorrect, result = null) => {
    setFeedback({
      type: isCorrect ? 'success' : 'error',
      message: isCorrect ? 'Correct answer!' : 'Incorrect. Please try again.',
      result,
      expected: questionData.expected_output
    });

    if (onResultUpdate) {
      onResultUpdate({
        isCorrect,
        submittedCode: editorRef.current?.getValue(),
        submittedAt: new Date()
      });
    }

    if (isCorrect) {
      handleClick(); // Show confetti

      // Notify parent component that this question is solved
      // Parent will handle game submission logic
      if (onQuestionSolved) {
        onQuestionSolved({
          questionId: questionData._id || questionData.id,
          questionIndex: currentQuestionIndex,
          isCorrect: true,
          code: editorRef.current?.getValue(),
          timestamp: new Date()
        });
      }

      console.log('Question solved correctly - notified parent component');
    }
  };




  const clearOutput = () => {
    setOutput('');
    setError('');
    setFeedback(null);
    setShowFeedback(false);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e] relative overflow-hidden">
      {/* Editor Header */}
      <div className="flex-shrink-0 h-10 bg-gray-100 dark:bg-[#333333] flex justify-between items-center px-4 border-b border-gray-200 dark:border-gray-700">
        <span className="font-medium text-sm text-gray-800 dark:text-gray-300">
          {subject === 'sql' ? 'MySQL Editor' : 'Python Editor'}
        </span>
      </div>

      {/* Editor Container */}
      <div className="flex-grow relative" ref={containerRef}>
        {/* Monaco Editor will be mounted here */}
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center justify-end space-x-3">
        <Button
          variant="outline"
          size="sm"
          className="bg-white dark:bg-gray-600 dark:hover:bg-gray-500 border-gray-300 dark:border-gray-500 text-gray-700 dark:text-white hover:bg-gray-50"
          onClick={() => handleCodeExecution(false)}
          disabled={isProcessing}
        >
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
          Run Code
        </Button>
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white border-none"
          onClick={() => handleCodeExecution(true)}
          disabled={isProcessing}
        >
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
          Submit
        </Button>

        {/* Submit Challenge Button - Only on last question */}
        {isLastQuestion && onSubmitChallenge && (
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white border-none"
            onClick={onSubmitChallenge}
            disabled={isProcessing}
          >
            Submit Challenge
          </Button>
        )}
      </div>

      {/* Internal Output (conditionally rendered) */}
      {!hideOutput && (
        <div className="h-1/3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1e1e1e] overflow-auto p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Output</h3>
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : output ? (
            <pre className="text-sm font-mono whitespace-pre-wrap text-gray-800 dark:text-gray-200">
              {typeof output === 'object' ? JSON.stringify(output, null, 2) : output}
            </pre>
          ) : (
            <div className="text-sm text-gray-400 italic">Run code to see output...</div>
          )}
        </div>
      )}

      {showFeedback && feedback && (
        <div className="absolute bottom-16 right-4 z-30 max-w-md">
          <Alert className={feedback.type === 'error' ? 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800'}
            variant={feedback.type === 'error' ? 'destructive' : 'default'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className={feedback.type === 'error' ? 'text-red-800 dark:text-red-300' : 'text-green-800 dark:text-green-300'}>
              {feedback.message}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}

export default CodeEditor;