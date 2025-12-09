import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/lib/theme-context';
import {
  FileText, Table2, ThumbsUp, ThumbsDown, Share2, Link,
  Gauge, NotebookText, Timer, Building2, Calendar, BookOpen
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const TableView = ({ data, theme }) => {
  if (!data || !data.columns || !data.rows) return null;

  return (
    <div className={`overflow-auto border rounded-md ${theme === 'dark' ? 'border-[#333333]' : 'border-gray-200'}`}>
      <table className="w-full text-sm">
        <thead className={theme === 'dark' ? 'bg-[#252526]' : 'bg-gray-100'}>
          <tr>
            {data.columns.map((column, idx) => (
              <th key={idx} className={`px-4 py-2 text-left font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`divide-y ${theme === 'dark' ? 'divide-[#333333]' : 'divide-gray-200'}`}>
          {data.rows.slice(0, 10).map((row, rowIdx) => (
            <tr key={rowIdx}>
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className={`px-4 py-2 whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {typeof cell === 'object' ? JSON.stringify(cell) : String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const QuestionPanel = ({ questionData }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('question');
  const [onlineCount, setOnlineCount] = useState(0);
  const [questionFeedback, setQuestionFeedback] = useState(null);
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const sharePopupRef = useRef(null);

  const isPython = questionData.test_cases !== undefined;

  // Helper to parse data overview string
  const parseDataOverview = (inputString) => {
    if (!inputString) return new Map();
    const resultMap = new Map();
    const lines = inputString.split("\n");

    lines.forEach(line => {
      const colonIndex = line.indexOf(":");
      if (colonIndex !== -1) {
        const key = line.slice(0, colonIndex).trim();
        const value = line.slice(colonIndex + 1).trim();
        resultMap.set(key, value);
      }
    });

    return resultMap;
  };

  // Online count effect
  useEffect(() => {
    const updateCount = () => {
      const min = 101;
      const max = 299;
      const count = Math.floor(Math.random() * (max - min + 1)) + min;
      setOnlineCount(count);
    };
    updateCount();
    const intervalId = setInterval(updateCount, 900000);
    return () => clearInterval(intervalId);
  }, []);

  // Click outside listener for popup
  useEffect(() => {
    function handleClickOutside(event) {
      if (sharePopupRef.current && !sharePopupRef.current.contains(event.target)) {
        setIsSharePopupOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSharePopupOpen]);

  // Share functionality
  const handleShareClick = (platform) => {
    const url = window.location.href;
    const title = questionData.title || "Check out this SQL question!";
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          toast.success("Link copied to clipboard!");
        }).catch(err => {
          console.error(err);
          toast.error("Failed to copy link.");
        });
        setIsSharePopupOpen(false);
        break;
      default:
        break;
    }
  };

  const getDifficultyStyle = (difficulty) => {
    if (!difficulty) return theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800';
    const normalized = difficulty.toLowerCase();
    if (normalized === 'advance' || normalized === 'advanced') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    if (normalized === 'medium') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    if (normalized === 'easy') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const tabs = ['Question'];
  if (!isPython) {
    if (questionData.table_data) tabs.push('Tables');
    if (questionData.expected_output) tabs.push('Expected Output');
  } else {
    tabs.push('Test Cases');
  }

  const renderTabContent = () => {
    switch (activeTab.toLowerCase()) {
      case 'question':
        return (
          <div className="space-y-6">
            <div>
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} m-0`}>
                {questionData.title}
              </h2>

              {/* Filters Section */}
              <div className="mt-3 mb-4 flex flex-wrap items-center gap-2">
                {questionData.difficulty && (
                  <span className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full capitalize ${getDifficultyStyle(questionData.difficulty)}`}>
                    <Gauge className="h-3 w-3" />
                    {questionData.difficulty}
                  </span>
                )}
                {questionData.subtopics && (Array.isArray(questionData.subtopics) ? questionData.subtopics : [questionData.subtopic || questionData.subtopics]).length > 0 && (
                  <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full capitalize bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    <NotebookText className="h-3 w-3" />
                    {Array.isArray(questionData.subtopics) ? questionData.subtopics.join(', ') : questionData.subtopic}
                  </span>
                )}
                {questionData.ideal_time && (
                  <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full capitalize bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                    <Timer className="h-3 w-3" />
                    {questionData.ideal_time}
                  </span>
                )}
                {questionData.company && questionData.company.map((company, compIndex) => (
                  <span key={compIndex} className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full capitalize bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                    <Building2 className="h-3 w-3" />
                    {company}
                  </span>
                ))}
                {questionData.year && (
                  <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full capitalize bg-[#f8caaa] text-[#F97316] dark:bg-[#f8caaa] dark:text-[#F97316]">
                    <Calendar className="h-3 w-3" />
                    {questionData.year}
                  </span>
                )}
              </div>

              {questionData.scenario && (
                <div className="mb-4 text-sm" dangerouslySetInnerHTML={{ __html: questionData.scenario.replace(/\n/g, '<br>') }} />
              )}

              <div className={`mt-4 p-4 border-l-4 border-teal-500 rounded-r-md ${theme === 'dark' ? 'bg-[#252526]/50' : 'bg-gray-50'}`}>
                <div
                  className={`prose ${theme === 'dark' ? 'prose-invert' : ''} max-w-none`}
                  dangerouslySetInnerHTML={{
                    __html: (questionData.question || questionData.question_text || '').replace(/\n/g, '<br>')
                  }}
                />
              </div>

              {/* Data Overview Section */}
              {questionData['data-overview'] && (
                <div className="mt-6">
                  <h4 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Data Overview</h4>
                  <div className={`border rounded-md overflow-hidden ${theme === 'dark' ? 'border-[#333333]' : 'border-gray-200'}`}>
                    <table className="w-full text-sm">
                      <tbody className={`divide-y ${theme === 'dark' ? 'divide-[#333333]' : 'divide-gray-200'}`}>
                        {Array.from(parseDataOverview(questionData['data-overview']).entries()).map(([key, value], rowIndex) => (
                          <tr key={rowIndex} className={rowIndex % 2 === 1 ? (theme === 'dark' ? 'bg-[#252526]' : 'bg-gray-50') : (theme === 'dark' ? 'bg-[#1e1e1e]' : 'bg-white')}>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>{key}</td>
                            <td className={`px-4 py-3 whitespace-normal text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Additional Information Section */}
              {(questionData.common_mistakes || questionData.interview_probability || questionData.roles) && (
                <div className="mt-6">
                  <h4 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Additional Information</h4>
                  <div className={`border rounded-md overflow-hidden ${theme === 'dark' ? 'border-[#333333]' : 'border-gray-200'}`}>
                    <table className="w-full text-sm">
                      <tbody className={`divide-y ${theme === 'dark' ? 'divide-[#333333]' : 'divide-gray-200'}`}>
                        {questionData.common_mistakes && (
                          <tr className={theme === 'dark' ? 'bg-[#1e1e1e]' : 'bg-white'}>
                            <td className={`px-4 py-3 font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Common Mistakes</td>
                            <td className={`px-4 py-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{questionData.common_mistakes}</td>
                          </tr>
                        )}
                        {questionData.interview_probability && (
                          <tr className={theme === 'dark' ? 'bg-[#252526]' : 'bg-gray-50'}>
                            <td className={`px-4 py-3 font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Interview Probability</td>
                            <td className={`px-4 py-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{questionData.interview_probability}</td>
                          </tr>
                        )}
                        {questionData.roles && (
                          <tr className={theme === 'dark' ? 'bg-[#252526]' : 'bg-gray-50'}>
                            <td className={`px-4 py-3 font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Job Roles</td>
                            <td className={`px-4 py-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{questionData.roles}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'tables':
        return (
          <div className="space-y-6">
            <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Tables</h3>
            <div className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              <p className="text-sm italic mb-4">Note: Only the top 10 rows of each table are displayed.</p>
            </div>
            {questionData.table_data && questionData.table_data.map((table, idx) => (
              <div key={idx} className="mb-6">
                <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{table.table_name}</h4>
                <TableView data={table} theme={theme} />
              </div>
            ))}
          </div>
        );

      case 'expected output':
        return (
          <div className="space-y-6">
            <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Expected Output</h3>
            <TableView data={questionData.expected_output} theme={theme} />
          </div>
        );

      case 'test cases':
        return <div className="p-4">Test Cases</div>;

      default:
        return <div className="p-4 text-center text-gray-500">Content for {activeTab} not available.</div>;
    }
  };

  return (
    <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-[#1e1e1e]' : 'bg-white'}`}>
      {/* Tabs Header */}
      <div className={`flex-shrink-0 px-4 border-b border-gray-200 dark:border-[#333333] flex justify-between items-center overflow-x-auto`}>
        <nav className="flex space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`py-2 px-1 text-sm font-medium transition-colors ${activeTab.toLowerCase() === tab.toLowerCase()
                ? 'border-b-2 border-teal-500 text-gray-900 dark:text-white'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              onClick={() => setActiveTab(tab.toLowerCase())}
            >
              <span className="flex items-center gap-2">
                {tab === 'Question' && <FileText className="h-5 w-5 text-[#14B8A6]" />}
                {tab === 'Tables' && <Table2 className="h-5 w-5 text-[#8E7128]" />}
                {tab === 'Expected Output' && <Table2 className="h-5 w-5 text-[#02B128]" />}
                {tab === 'Test Cases' && <BookOpen className="h-5 w-5 text-orange-500" />}
                {tab}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-grow p-5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-900 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {renderTabContent()}
      </div>

      {/* Bottom Bar */}
      <div className={`flex-shrink-0 flex items-center justify-between mb-1 mt-1 pl-3 pr-3 border-t ${theme === 'dark' ? 'border-[#333333]' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-2 py-2">
          <button
            onClick={() => setQuestionFeedback(questionFeedback === 'like' ? null : 'like')}
            className={`p-2 rounded-md flex items-center space-x-2 transition-colors ${questionFeedback === 'like'
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
          >
            <ThumbsUp size={18} />
          </button>
          <button
            onClick={() => setQuestionFeedback(questionFeedback === 'dislike' ? null : 'dislike')}
            className={`p-2 rounded-md flex items-center space-x-2 transition-colors ${questionFeedback === 'dislike'
              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
          >
            <ThumbsDown size={18} />
          </button>

          <div className={`w-[1px] h-6 ${theme === 'dark' ? 'bg-[#333333]' : 'bg-gray-200'} mx-1`}></div>

          <div className="relative">
            <button
              onClick={() => setIsSharePopupOpen(prev => !prev)}
              className="p-2 rounded-md flex items-center space-x-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Share2 size={18} />
            </button>
            {isSharePopupOpen && (
              <div
                ref={sharePopupRef}
                className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 p-2 rounded-lg shadow-lg border flex items-center space-x-2 z-30 ${theme === 'dark' ? 'bg-[#252526] border-[#333333]' : 'bg-white border-gray-200'}`}
              >
                <button
                  onClick={() => handleShareClick('copy')}
                  title="Copy link"
                  className="p-2 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white"
                >
                  <Link size={16} />
                </button>
                <button
                  onClick={() => handleShareClick('facebook')}
                  title="Share on Facebook"
                  className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#1877F2] text-white font-bold text-lg hover:opacity-90"
                >
                  f
                </button>
                <button
                  onClick={() => handleShareClick('linkedin')}
                  title="Share on LinkedIn"
                  className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#0A66C2] text-white font-bold text-base hover:opacity-90"
                >
                  in
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={`flex items-center space-x-2 text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>{onlineCount.toLocaleString()} Online</span>
        </div>
      </div>
    </div>
  );
};

export { QuestionPanel };