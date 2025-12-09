// // DataWars.jsx - Redesigned with Split Layout
// import React, { useEffect, useState, useMemo, useRef } from "react"
// import { Maximize2, Minimize2, Moon, Sun, Clock, LayoutDashboard, User, X } from "lucide-react"
// import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
// import { CodeEditor } from "../components/challenge/Code-editor"
// import { QuestionPanel } from "../components/challenge/Question-panel"
// import { Button } from "../components/ui/button"
// import { useTheme } from "../lib/theme-context"
// import { useWebSocketContext } from "@/util/WebsocketProvider"
// import Result from "@/components/challenge/Game-result"
// import { useLocation, useNavigate } from "react-router-dom"
// import GameStartAnimation from "@/components/challenge/GameStartAnimation"
// import ConnectionStatusPopup from "@/components/challenge/ConnectionStatusPopup"
// import PlayerAbandoned from "@/components/challenge/PlayerAbondedPopup"
// import { useUser, UserButton } from '@clerk/clerk-react'
// import Split from 'react-split'
// import { createAvatar } from '@dicebear/core';
// import { dylan } from '@dicebear/collection';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"

// // Custom styles for Split.js
// const splitStyles = `
// .gutter {
//   background-color: #E5E7EB;
//   background-repeat: no-repeat;
//   background-position: 50%;
// }
// .gutter:hover {
//   background-color: #14B8A6;
//   cursor: col-resize;
// }
// .gutter.gutter-vertical {
//   background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAFAQMAAABo7865AAAABlBMVEVHcEzMzMzyAv2sAAAAAXRSTlMAQObYZgAAABBJREFUeF5jOAMEEAIEEFwAn3kMwcB6I2AAAAAASUVORK5CYII=');
//   cursor: row-resize;
// }
// .gutter.gutter-horizontal {
//   background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');
//   cursor: col-resize;
// }
// `;

// export default function DataWars() {
//   const { isLoaded, isSignedIn, user } = useUser()
//   const [time, setTime] = useState(0)
//   const [timerRunning, setTimerRunning] = useState(false)
//   const [isFullScreen, setIsFullScreen] = useState(false)
//   const [showIntro, setShowIntro] = useState(true)
//   const [playersReady, setPlayersReady] = useState(false)
//   const location = useLocation()
//   const navigate = useNavigate()
//   const [userId, setUserId] = useState(null)
//   const { data } = location.state || {}
//   const [isAbonded, setIsAbonded] = useState(false)
//   const [gameStatus, setGameStatus] = useState({
//     isWinner: false,
//     isOpponentWon: false,
//     winnerName: null,
//     isTie: false,
//     margin: null,
//   })
//   const [playerData, setPlayerData] = useState(null)

//   // Lifted state for CodeEditor and Output
//   const [editorOutput, setEditorOutput] = useState(null);
//   const [editorError, setEditorError] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);

//   // Add fallback for theme context
//   const themeContext = useTheme()
//   const theme = themeContext?.theme || 'dark'
//   const toggleTheme = themeContext?.toggleTheme || (() => { })

//   //Bot states
//   const [isBotGame, setIsBotGame] = useState(false);
//   const [botTimer, setBotTimer] = useState(null);
//   const [isUserWon, setIsUserWon] = useState(false);

//   // Add fallback for WebSocket context
//   const wsContext = useWebSocketContext()
//   const { socket, isConnected } = wsContext || { socket: null, isConnected: false }

//   const challengeType = new URLSearchParams(window.location.search).get("challengeType")
//   const subject = new URLSearchParams(window.location.search).get("selectedSubject")
//   const customTime = new URLSearchParams(window.location.search).get("customTime")

//   // Get isBot from URL params
//   const isBot = new URLSearchParams(window.location.search).get("isNexus") === "true";

//   // Player VS Popup state
//   const [isVsPopupOpen, setIsVsPopupOpen] = useState(false);

//   const handleDataFromChild = (data) => {
//     setIsUserWon(data);
//   };

//   useEffect(() => {
//     if (isBot === true && isUserWon) {
//       setGameStatus({
//         isWinner: true,
//         isOpponentWon: false,
//         winnerName: data?.players[0], // Player's name
//         isTie: false,
//         margin: "You completed the challenge faster",
//       });
//     } else {
//       console.log(isUserWon)
//     }
//   }, [isBot, isUserWon])

//   // Add error handling for avatar generation
//   const generateAvatarUrl = (seed) => {
//     try {
//       const svg = createAvatar(dylan, { seed, size: 128 }).toString();
//       return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
//     } catch (error) {
//       console.error('Avatar generation failed:', error);
//       return '/api/placeholder/128/128'; // Fallback image
//     }
//   };

//   const player1Avatar = useMemo(() => generateAvatarUrl(data?.players?.[0] || 'player1'), [data?.players?.[0]]);
//   const player2Avatar = useMemo(() => generateAvatarUrl(data?.players?.[1] || 'player2'), [data?.players?.[1]]);

//   // Initialize bot game if needed
//   useEffect(() => {
//     if (isBot) {
//       setIsBotGame(true);
//       initializeBotGame();
//     }
//   }, [isBot]);

//   useEffect(() => {
//     if (isLoaded && isSignedIn) {
//       setUserId(user.id)
//     }
//   }, [isLoaded, isSignedIn, user])

//   const initializeBotGame = () => {
//     // Clear any existing bot timer
//     if (botTimer) {
//       clearTimeout(botTimer);
//     }

//     // Random time between 5-15 minutes in milliseconds
//     const botDecisionTime = (Math.floor(Math.random() * (15 - 5 + 1)) + 5) * 60 * 1000;

//     // Random win/lose decision
//     const botWillWin = Math.random() < 0.5;

//     // Set timer for bot's move
//     const timer = setTimeout(() => {
//       if (botWillWin) {
//         setGameStatus({
//           isWinner: false,
//           isOpponentWon: true,
//           winnerName: data?.players?.[1] || 'Bot', // Bot's name
//           isTie: false,
//           margin: "Opponent completed the challenge faster!",
//         });
//       } else {
//         setGameStatus({
//           isWinner: true,
//           isOpponentWon: false,
//           winnerName: data?.players?.[0] || 'Player', // Player's name
//           isTie: false,
//           margin: "You completed the challenge faster!",
//         });
//       }
//     }, botDecisionTime);

//     setBotTimer(timer);
//   };

//   // Cleanup bot timer when component unmounts or game ends
//   useEffect(() => {
//     return () => {
//       if (botTimer) {
//         clearTimeout(botTimer);
//       }
//     };
//   }, [botTimer]);

//   // Ensure players data is ready
//   useEffect(() => {
//     if (data?.players?.length >= 2) {
//       setPlayersReady(true)
//       setPlayerData(data)
//     }
//   }, [data])

//   // WebSocket event handlers with better error handling
//   useEffect(() => {
//     if (!socket || !isConnected) return;

//     const handleGameEnded = async (data) => {
//       console.log("Game ended event received:", data);

//       const { isWinner, isOpponentWon, winnerName } = data;

//       // Update game status
//       setGameStatus({
//         isWinner,
//         isOpponentWon,
//         winnerName,
//         isTie: !isWinner && !isOpponentWon,
//         margin: isWinner ? "You won!" : isOpponentWon ? "Opponent won!" : "It's a tie!"
//       });

//       let result = "none";
//       if (isWinner) {
//         try {
//           result = "won";
//         } catch (error) {
//           console.error("Failed to credit fuel:", error);
//         }
//       } else if (isOpponentWon) {
//         result = "lost";
//       } else {
//         result = "tie";
//       }
//     };

//     socket.on("gameEnded", handleGameEnded);

//     return () => {
//       socket.off("gameEnded", handleGameEnded);
//     };
//   }, [socket, isConnected, userId, challengeType, subject]);

//   useEffect(() => {
//     if (!socket || !isConnected) return;

//     const handleGameForfeit = async (data) => {
//       setIsAbonded(true);
//     };

//     socket.on("gameForfeited", handleGameForfeit);

//     return () => {
//       socket.off("gameForfeited", handleGameForfeit);
//     };
//   }, [socket, isConnected, userId]);

//   const toggleFullScreen = () => {
//     if (!document.fullscreenElement) {
//       document.documentElement.requestFullscreen()
//       setIsFullScreen(true)
//     } else if (document.exitFullscreen) {
//       document.exitFullscreen()
//       setIsFullScreen(false)
//     }
//   }

//   // Timer logic with better error handling
//   useEffect(() => {
//     let mappedChallengeType = 0
//     const timeInMinutes = parseInt(customTime) || 10; // Default to 10 minutes

//     switch (challengeType) {
//       case "Python Bullet Surge - Easy":
//       case "Python Bullet Surge - Medium":
//       case "Python Bullet Surge - Hard":
//         mappedChallengeType = timeInMinutes * 60;
//         break;
//       case "Python Rapid Sprint - Easy":
//         mappedChallengeType = 30 * 60;
//         break;
//       case "Python Rapid Sprint - Medium":
//         mappedChallengeType = 60 * 60;
//         break;
//       case "Python Rapid Sprint - Hard":
//         mappedChallengeType = 90 * 60;
//         break;
//       case "Python Daily Dash - Easy":
//       case "Python Daily Dash - Medium":
//         mappedChallengeType = 24 * 60 * 60;
//         break;
//       case "SQL Bullet Surge - Easy":
//         mappedChallengeType = 8 * 60;
//         break;
//       case "SQL Bullet Surge - Medium":
//         mappedChallengeType = 12 * 60;
//         break;
//       case "SQL Bullet Surge - Hard":
//         mappedChallengeType = 20 * 60;
//         break;
//       case "SQL Rapid Sprint - Easy":
//         mappedChallengeType = 30 * 60;
//         break;
//       case "SQL Rapid Sprint - Medium":
//         mappedChallengeType = 45 * 60;
//         break;
//       case "SQL Rapid Sprint - Hard":
//         mappedChallengeType = 60 * 60;
//         break;
//       case "SQL Daily Dash - Easy":
//       case "SQL Daily Dash - Medium":
//         mappedChallengeType = 24 * 60 * 60;
//         break;
//       case "Power Hour":
//         mappedChallengeType = 60 * 60;
//         break;
//       case "Code Marathon":
//         mappedChallengeType = 120 * 60;
//         break;
//       case "Bullet Surge":
//       case "Bullet":
//         mappedChallengeType = 10 * 60;
//         break;
//       case "Build your Custom Challenge":
//         mappedChallengeType = timeInMinutes * 60;
//         break;
//       default:
//         console.error('Unknown challenge type:', challengeType);
//         mappedChallengeType = timeInMinutes * 60;
//     }

//     setTime(mappedChallengeType)
//   }, [challengeType, customTime])

//   useEffect(() => {
//     if (timerRunning && time > 0) {
//       const interval = setInterval(() => {
//         setTime((prevTime) => prevTime - 1);
//       }, 1000);

//       return () => clearInterval(interval);
//     } else if (time === 0 && timerRunning) {
//       if (isBotGame) {
//         setGameStatus({
//           isWinner: false,
//           isOpponentWon: true,
//           winnerName: data?.players?.[1] || 'Bot',
//           isTie: false,
//           margin: "Time's up! Bot wins!",
//         });
//       } else {
//         handleGameTie();
//       }
//     }
//   }, [time, timerRunning, isBotGame]);

//   const handleComplete = () => {
//     console.log("Animation completed, starting game...");
//     setShowIntro(false);
//     if (time > 0) {
//       setTimerRunning(true);
//     }
//     if (isBotGame) {
//       initializeBotGame();
//     }
//   };

//   const handleGameTie = () => {
//     setGameStatus({
//       isWinner: false,
//       isOpponentWon: false,
//       winnerName: null,
//       isTie: true,
//       margin: "Time's up!",
//     })

//     if (socket) {
//       socket.emit("gameTimeUp", {
//         gameId: localStorage.getItem("gameId"),
//       })
//     }
//   }

//   const formatTime = (timeInSeconds) => {
//     const hours = Math.floor(timeInSeconds / 3600)
//     const minutes = Math.floor((timeInSeconds % 3600) / 60)
//     const seconds = timeInSeconds % 60

//     return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
//   }

//   // Ensure we have player data
//   const player1Name = data?.players?.[0] || 'Player 1';
//   const player2Name = data?.players?.[1] || 'Player 2';

//   // Better loading state with fallback data
//   if (!playersReady || !data?.question) {
//     return (
//       <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center">
//         <div className="text-center text-white">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
//           <h4 className="text-lg">Loading game data...</h4>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <>
//       <style>{splitStyles}</style>
//       {showIntro && (
//         <GameStartAnimation
//           onComplete={handleComplete}
//           player1Data={{
//             name: player1Name,
//             title: "Challenger",
//             image: player1Avatar,
//           }}
//           player2Data={{
//             name: player2Name,
//             title: "Defender",
//             image: player2Avatar,
//           }}
//         />
//       )}

//       {isAbonded && <PlayerAbandoned />}

//       <div className={`h-screen flex flex-col overflow-hidden ${theme === "dark" ? "bg-[#1e1e1e] text-white" : "bg-gray-50 text-gray-900"}`}>
//         {/* Navbar */}
//         <nav className={`h-14 border-b flex items-center justify-between px-4 ${theme === "dark" ? "bg-[#0F0F0F] border-[#333333]" : "bg-white border-gray-200"}`}>
//           <div className="flex items-center gap-4">
//             <div className="flex items-center gap-2">
//               <div className="w-18 h-8 flex items-center justify-center">
//                 <img src="/images/coderpadLogo.png" alt="Logo" className="w-18 h-12 cursor-pointer logo-flip" />
//               </div>
//               <span className="font-semibold text-lg hidden md:block">SQL Coderpad</span>
//             </div>

//             {/* VS Popup Trigger */}
//             <div
//               className="flex items-center -space-x-2 cursor-pointer hover:opacity-80 transition-opacity ml-4"
//               onClick={() => setIsVsPopupOpen(true)}
//             >
//               <Avatar className="h-8 w-8 border-2 border-[#1e1e1e] z-0">
//                 <AvatarImage src={player1Avatar} />
//                 <AvatarFallback>P1</AvatarFallback>
//               </Avatar>
//               <div className="h-5 w-5 rounded-full bg-red-500 border-2 border-[#1e1e1e] flex items-center justify-center text-[8px] font-bold text-white z-20 relative">
//                 VS
//               </div>
//               <Avatar className="h-8 w-8 border-2 border-[#1e1e1e] z-0">
//                 <AvatarImage src={player2Avatar} />
//                 <AvatarFallback>P2</AvatarFallback>
//               </Avatar>
//             </div>
//           </div>

//           <div className="flex items-center gap-4">
//             <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${theme === "dark" ? "bg-[#333333]" : "bg-gray-100"}`}>
//               <Clock className="w-4 h-4 text-teal-500" />
//               <span className="font-mono font-medium">{formatTime(time)}</span>
//             </div>

//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={toggleTheme}
//               className="text-gray-400 hover:text-white"
//             >
//               {theme === "dark" ? <Sun className="h-5 w-5 text-black dark:text-white" /> : <Moon className="h-5 w-5 text-black dark:text-white" />}
//             </Button>

//             <Button
//               variant="ghost"
//               size="sm"
//               className="gap-2 text-gray-400 hover:text-white hidden md:flex"
//               onClick={() => window.open("https://dashboard.datasenseai.com/dashboard", "_blank")}
//             >
//               <LayoutDashboard className="h-4 w-4 text-black dark:text-white" />
//               {/* Dashboard */}
//             </Button>

//             <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
//           </div>
//         </nav>

//         {/* Main Content - Split Layout */}
//         <div className="flex-1 overflow-hidden">
//           <Split
//             className="flex h-full"
//             sizes={[40, 60]}
//             minSize={300}
//             gutterSize={4}
//             snapOffset={30}
//             dragInterval={1}
//             direction="horizontal"
//           >
//             {/* Left Panel - Question */}
//             <div className="h-full overflow-hidden bg-[#1e1e1e]">
//               <QuestionPanel questionData={data.question} />
//             </div>

//             {/* Right Panel - Editor & Output */}
//             <div className="h-full overflow-hidden">
//               <Split
//                 className="h-full flex flex-col"
//                 sizes={[70, 30]}
//                 minSize={100}
//                 gutterSize={4}
//                 snapOffset={30}
//                 dragInterval={1}
//                 direction="vertical"
//               >
//                 {/* Top - Code Editor */}
//                 <div className="h-full overflow-hidden">
//                   <CodeEditor
//                     subject={subject}
//                     questionData={data.question}
//                     sendDataToParent={handleDataFromChild}
//                     hideOutput={true}
//                     externalOutput={editorOutput}
//                     externalSetOutput={setEditorOutput}
//                     externalError={editorError}
//                     externalSetError={setEditorError}
//                     externalIsProcessing={isProcessing}
//                     externalSetIsProcessing={setIsProcessing}
//                   />
//                 </div>

//                 {/* Bottom - Output */}
//                 <div className={`h-full overflow-hidden flex flex-col ${theme === "dark" ? "bg-[#1e1e1e]" : "bg-white"}`}>
//                   <div className={`flex-shrink-0 h-10 flex justify-between items-center px-4 ${theme === "dark" ? "bg-[#333333]" : "bg-gray-100"}`}>
//                     <span className={`font-medium text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-800"}`}>Output</span>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => {
//                         setEditorOutput(null);
//                         setEditorError('');
//                       }}
//                       className="h-6 text-xs hover:bg-gray-200 dark:hover:bg-gray-700"
//                     >
//                       Clear
//                     </Button>
//                   </div>

//                   <div className="flex-grow overflow-auto p-4 font-mono text-sm">
//                     {editorError ? (
//                       <div className="text-red-500 bg-red-500/10 p-3 rounded-md">
//                         {editorError}
//                       </div>
//                     ) : editorOutput ? (
//                       <div>
//                         {editorOutput.error ? (
//                           <div className="text-red-500 bg-red-500/10 p-3 rounded-md">
//                             <p>{editorOutput.message}</p>
//                             {editorOutput.details && <p className="mt-1 text-xs opacity-80">{editorOutput.details}</p>}
//                           </div>
//                         ) : Array.isArray(editorOutput) && editorOutput.length > 0 ? (
//                           <div className="overflow-x-auto">
//                             <table className="w-full border-collapse text-left">
//                               <thead>
//                                 <tr className={theme === 'dark' ? 'bg-[#2B3440]' : 'bg-gray-200'}>
//                                   {Object.keys(editorOutput[0]).map((header, index) => (
//                                     <th key={index} className="p-2 border-b border-gray-600 font-semibold">{header}</th>
//                                   ))}
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {editorOutput.map((row, rowIndex) => (
//                                   <tr key={rowIndex} className={`border-b ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-100'}`}>
//                                     {Object.values(row).map((cell, cellIndex) => (
//                                       <td key={cellIndex} className="p-2 whitespace-nowrap">
//                                         {typeof cell === 'object' ? JSON.stringify(cell) : cell}
//                                       </td>
//                                     ))}
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </table>
//                           </div>
//                         ) : (
//                           <pre className={`whitespace-pre-wrap ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
//                             {typeof editorOutput === 'object' ? JSON.stringify(editorOutput, null, 2) : editorOutput}
//                           </pre>
//                         )}
//                       </div>
//                     ) : (
//                       <div className={`text-center py-8 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`}>
//                         Run your code to see the output here
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </Split>
//             </div>
//           </Split>
//         </div>
//       </div>

//       {/* VS Popup Dialog */}
//       <Dialog open={isVsPopupOpen} onOpenChange={setIsVsPopupOpen}>
//         <DialogContent className={`${theme === "dark" ? "bg-[#1E293B] text-white border-gray-700" : "bg-white text-gray-900"}`}>
//           <DialogHeader>
//             <DialogTitle className="text-center text-2xl font-bold mb-6">Matchup</DialogTitle>
//           </DialogHeader>
//           <div className="flex items-center justify-center gap-8 py-8">
//             <div className="flex flex-col items-center gap-3">
//               <Avatar className="h-24 w-24 border-4 border-teal-500">
//                 <AvatarImage src={player1Avatar} />
//                 <AvatarFallback>P1</AvatarFallback>
//               </Avatar>
//               <span className="font-bold text-lg">{player1Name}</span>
//               <span className="text-sm text-teal-500 font-medium">Challenger</span>
//             </div>

//             <div className="text-3xl font-black text-gray-500">VS</div>

//             <div className="flex flex-col items-center gap-3">
//               <Avatar className="h-24 w-24 border-4 border-red-500">
//                 <AvatarImage src={player2Avatar} />
//                 <AvatarFallback>P2</AvatarFallback>
//               </Avatar>
//               <span className="font-bold text-lg">{player2Name}</span>
//               <span className="text-sm text-red-500 font-medium">Defender</span>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {(gameStatus.isWinner || gameStatus.isOpponentWon || gameStatus.isTie) && (
//         <Result
//           gameStatus={gameStatus}
//           playerData={player1Name}
//           opponentData={player2Name}
//           player1Avatar={player1Avatar}
//           player2Avatar={player2Avatar}
//           userId={userId}
//           challengeType={challengeType}
//         />
//       )}

//       <ConnectionStatusPopup />
//     </>
//   )
// }
// DataWars.jsx - Redesigned with Split Layout
import React, { useEffect, useState, useMemo, useRef } from "react"
import { Maximize2, Minimize2, Moon, Sun, Clock, LayoutDashboard, User, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { CodeEditor } from "../components/challenge/Code-editor"
import { QuestionPanel } from "../components/challenge/Question-panel"
import { Button } from "../components/ui/button"
import { useTheme } from "../lib/theme-context"
import { useWebSocketContext } from "@/util/WebsocketProvider"
import Result from "@/components/challenge/Game-result"
import { useLocation, useNavigate } from "react-router-dom"
import GameStartAnimation from "@/components/challenge/GameStartAnimation"
import ConnectionStatusPopup from "@/components/challenge/ConnectionStatusPopup"
import PlayerAbandoned from "@/components/challenge/PlayerAbondedPopup"
import { useUser, UserButton } from '@clerk/clerk-react'
import Split from 'react-split'
import { createAvatar } from '@dicebear/core';
import { dylan } from '@dicebear/collection';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Custom styles for Split.js
const splitStyles = `
.gutter {
  background-color: #E5E7EB;
  background-repeat: no-repeat;
  background-position: 50%;
}
.gutter:hover {
  background-color: #14B8A6;
  cursor: col-resize;
}
.gutter.gutter-vertical {
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAFAQMAAABo7865AAAABlBMVEVHcEzMzMzyAv2sAAAAAXRSTlMAQObYZgAAABBJREFUeF5jOAMEEAIEEFwAn3kMwcB6I2AAAAAASUVORK5CYII=');
  cursor: row-resize;
}
.gutter.gutter-horizontal {
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');
  cursor: col-resize;
}
`;

export default function DataWars() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [time, setTime] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const [playersReady, setPlayersReady] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const [userId, setUserId] = useState(null)
  const { data } = location.state || {}
  const [isAbonded, setIsAbonded] = useState(false)
  const [gameStatus, setGameStatus] = useState({
    isWinner: false,
    isOpponentWon: false,
    winnerName: null,
    isTie: false,
    margin: null,
  })
  const [playerData, setPlayerData] = useState(null)

  // Lifted state for CodeEditor and Output
  const [editorOutput, setEditorOutput] = useState(null);
  const [editorError, setEditorError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Add fallback for theme context
  const themeContext = useTheme()
  const theme = themeContext?.theme || 'dark'
  const toggleTheme = themeContext?.toggleTheme || (() => { })

  //Bot states
  const [isBotGame, setIsBotGame] = useState(false);
  const [botTimer, setBotTimer] = useState(null);
  const [isUserWon, setIsUserWon] = useState(false);

  // Add fallback for WebSocket context
  const wsContext = useWebSocketContext()
  const { socket, isConnected } = wsContext || { socket: null, isConnected: false }

  const challengeType = new URLSearchParams(window.location.search).get("challengeType")
  const subject = new URLSearchParams(window.location.search).get("selectedSubject")
  const customTime = new URLSearchParams(window.location.search).get("customTime")

  // Get isBot from URL params
  const isBot = new URLSearchParams(window.location.search).get("isNexus") === "true";

  // Player VS Popup state
  const [isVsPopupOpen, setIsVsPopupOpen] = useState(false);

  const handleDataFromChild = (data) => {
    setIsUserWon(data);
  };

  useEffect(() => {
    if (isBot === true && isUserWon) {
      setGameStatus({
        isWinner: true,
        isOpponentWon: false,
        winnerName: data?.players[0], // Player's name
        isTie: false,
        margin: "You completed the challenge faster",
      });
    } else {
      console.log(isUserWon)
    }
  }, [isBot, isUserWon])

  // Add error handling for avatar generation
  const generateAvatarUrl = (seed) => {
    try {
      const svg = createAvatar(dylan, { seed, size: 128 }).toString();
      return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    } catch (error) {
      console.error('Avatar generation failed:', error);
      return '/api/placeholder/128/128'; // Fallback image
    }
  };

  const player1Avatar = useMemo(() => generateAvatarUrl(data?.players?.[0] || 'player1'), [data?.players?.[0]]);
  const player2Avatar = useMemo(() => generateAvatarUrl(data?.players?.[1] || 'player2'), [data?.players?.[1]]);

  // Initialize bot game if needed
  useEffect(() => {
    if (isBot) {
      setIsBotGame(true);
      initializeBotGame();
    }
  }, [isBot]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setUserId(user.id)
    }
  }, [isLoaded, isSignedIn, user])

  const initializeBotGame = () => {
    // Clear any existing bot timer
    if (botTimer) {
      clearTimeout(botTimer);
    }

    // Random time between 5-15 minutes in milliseconds
    const botDecisionTime = (Math.floor(Math.random() * (15 - 5 + 1)) + 5) * 60 * 1000;

    // Random win/lose decision
    const botWillWin = Math.random() < 0.5;

    // Set timer for bot's move
    const timer = setTimeout(() => {
      if (botWillWin) {
        setGameStatus({
          isWinner: false,
          isOpponentWon: true,
          winnerName: data?.players?.[1] || 'Bot', // Bot's name
          isTie: false,
          margin: "Opponent completed the challenge faster!",
        });
      } else {
        setGameStatus({
          isWinner: true,
          isOpponentWon: false,
          winnerName: data?.players?.[0] || 'Player', // Player's name
          isTie: false,
          margin: "You completed the challenge faster!",
        });
      }
    }, botDecisionTime);

    setBotTimer(timer);
  };

  // Cleanup bot timer when component unmounts or game ends
  useEffect(() => {
    return () => {
      if (botTimer) {
        clearTimeout(botTimer);
      }
    };
  }, [botTimer]);

  // Ensure players data is ready
  useEffect(() => {
    if (data?.players?.length >= 2) {
      setPlayersReady(true)
      setPlayerData(data)
    }
  }, [data])

  // WebSocket event handlers with better error handling
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleGameEnded = async (data) => {
      console.log("Game ended event received:", data);

      const { isWinner, isOpponentWon, winnerName } = data;

      // Update game status
      setGameStatus({
        isWinner,
        isOpponentWon,
        winnerName,
        isTie: !isWinner && !isOpponentWon,
        margin: isWinner ? "You won!" : isOpponentWon ? "Opponent won!" : "It's a tie!"
      });

      let result = "none";
      if (isWinner) {
        try {
          result = "won";
        } catch (error) {
          console.error("Failed to credit fuel:", error);
        }
      } else if (isOpponentWon) {
        result = "lost";
      } else {
        result = "tie";
      }
    };

    socket.on("gameEnded", handleGameEnded);

    return () => {
      socket.off("gameEnded", handleGameEnded);
    };
  }, [socket, isConnected, userId, challengeType, subject]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleGameForfeit = async (data) => {
      setIsAbonded(true);
    };

    socket.on("gameForfeited", handleGameForfeit);

    return () => {
      socket.off("gameForfeited", handleGameForfeit);
    };
  }, [socket, isConnected, userId]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullScreen(true)
    } else if (document.exitFullscreen) {
      document.exitFullscreen()
      setIsFullScreen(false)
    }
  }

  // --- TIMER LOGIC FIX ---
  useEffect(() => {
    let mappedChallengeType = 0
    const timeInMinutes = parseInt(customTime) || 10; // Default from URL

    switch (challengeType) {
      // Legacy hardcoded cases
      case "Python Bullet Surge - Easy":
      case "Python Bullet Surge - Medium":
      case "Python Bullet Surge - Hard":
        mappedChallengeType = timeInMinutes * 60;
        break;
      case "Python Rapid Sprint - Easy":
        mappedChallengeType = 30 * 60;
        break;
      case "Python Rapid Sprint - Medium":
        mappedChallengeType = 60 * 60;
        break;
      case "Python Rapid Sprint - Hard":
        mappedChallengeType = 90 * 60;
        break;
      
      // SQL Legacy
      case "SQL Bullet Surge - Easy":
        mappedChallengeType = 8 * 60;
        break;
      case "SQL Bullet Surge - Medium":
        mappedChallengeType = 12 * 60;
        break;
      case "SQL Bullet Surge - Hard":
        mappedChallengeType = 20 * 60;
        break;
        
      // FIX: New Lobby Generic Types -> Use customTime
      case "Bullet Surge":
      case "Bullet":
      case "Rapid Sprint": // Added support for Team mode
        mappedChallengeType = timeInMinutes * 60; // Use URL param!
        break;
        
      case "Build your Custom Challenge":
        mappedChallengeType = timeInMinutes * 60;
        break;
        
      default:
        // Default fallthrough for unknown types
        mappedChallengeType = timeInMinutes * 60;
    }

    setTime(mappedChallengeType)
  }, [challengeType, customTime])

  useEffect(() => {
    if (timerRunning && time > 0) {
      const interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else if (time === 0 && timerRunning) {
      if (isBotGame) {
        setGameStatus({
          isWinner: false,
          isOpponentWon: true,
          winnerName: data?.players?.[1] || 'Bot',
          isTie: false,
          margin: "Time's up! Bot wins!",
        });
      } else {
        handleGameTie();
      }
    }
  }, [time, timerRunning, isBotGame]);

  const handleComplete = () => {
    console.log("Animation completed, starting game...");
    setShowIntro(false);
    if (time > 0) {
      setTimerRunning(true);
    }
    if (isBotGame) {
      initializeBotGame();
    }
  };

  const handleGameTie = () => {
    setGameStatus({
      isWinner: false,
      isOpponentWon: false,
      winnerName: null,
      isTie: true,
      margin: "Time's up!",
    })

    if (socket) {
      socket.emit("gameTimeUp", {
        gameId: localStorage.getItem("gameId"),
      })
    }
  }

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600)
    const minutes = Math.floor((timeInSeconds % 3600) / 60)
    const seconds = timeInSeconds % 60

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Ensure we have player data
  const player1Name = data?.players?.[0] || 'Player 1';
  const player2Name = data?.players?.[1] || 'Player 2';

  // Better loading state with fallback data
  if (!playersReady || !data?.question) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h4 className="text-lg">Loading game data...</h4>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{splitStyles}</style>
      {showIntro && (
        <GameStartAnimation
          onComplete={handleComplete}
          player1Data={{
            name: player1Name,
            title: "Challenger",
            image: player1Avatar,
          }}
          player2Data={{
            name: player2Name,
            title: "Defender",
            image: player2Avatar,
          }}
        />
      )}

      {isAbonded && <PlayerAbandoned />}

      <div className={`h-screen flex flex-col overflow-hidden ${theme === "dark" ? "bg-[#1e1e1e] text-white" : "bg-gray-50 text-gray-900"}`}>
        {/* Navbar */}
        <nav className={`h-14 border-b flex items-center justify-between px-4 ${theme === "dark" ? "bg-[#0F0F0F] border-[#333333]" : "bg-white border-gray-200"}`}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-18 h-8 flex items-center justify-center">
                <img src="/images/coderpadLogo.png" alt="Logo" className="w-18 h-12 cursor-pointer logo-flip" />
              </div>
              <span className="font-semibold text-lg hidden md:block">SQL Coderpad</span>
            </div>

            {/* VS Popup Trigger */}
            <div
              className="flex items-center -space-x-2 cursor-pointer hover:opacity-80 transition-opacity ml-4"
              onClick={() => setIsVsPopupOpen(true)}
            >
              <Avatar className="h-8 w-8 border-2 border-[#1e1e1e] z-0">
                <AvatarImage src={player1Avatar} />
                <AvatarFallback>P1</AvatarFallback>
              </Avatar>
              <div className="h-5 w-5 rounded-full bg-red-500 border-2 border-[#1e1e1e] flex items-center justify-center text-[8px] font-bold text-white z-20 relative">
                VS
              </div>
              <Avatar className="h-8 w-8 border-2 border-[#1e1e1e] z-0">
                <AvatarImage src={player2Avatar} />
                <AvatarFallback>P2</AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${theme === "dark" ? "bg-[#333333]" : "bg-gray-100"}`}>
              <Clock className="w-4 h-4 text-teal-500" />
              <span className="font-mono font-medium">{formatTime(time)}</span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-400 hover:text-white"
            >
              {theme === "dark" ? <Sun className="h-5 w-5 text-black dark:text-white" /> : <Moon className="h-5 w-5 text-black dark:text-white" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-gray-400 hover:text-white hidden md:flex"
              onClick={() => window.open("https://dashboard.datasenseai.com/dashboard", "_blank")}
            >
              <LayoutDashboard className="h-4 w-4 text-black dark:text-white" />
              {/* Dashboard */}
            </Button>

            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
          </div>
        </nav>

        {/* Main Content - Split Layout */}
        <div className="flex-1 overflow-hidden">
          <Split
            className="flex h-full"
            sizes={[40, 60]}
            minSize={300}
            gutterSize={4}
            snapOffset={30}
            dragInterval={1}
            direction="horizontal"
          >
            {/* Left Panel - Question */}
            <div className="h-full overflow-hidden bg-[#1e1e1e]">
              <QuestionPanel questionData={data.question} />
            </div>

            {/* Right Panel - Editor & Output */}
            <div className="h-full overflow-hidden">
              <Split
                className="h-full flex flex-col"
                sizes={[70, 30]}
                minSize={100}
                gutterSize={4}
                snapOffset={30}
                dragInterval={1}
                direction="vertical"
              >
                {/* Top - Code Editor */}
                <div className="h-full overflow-hidden">
                  <CodeEditor
                    subject={subject}
                    questionData={data.question}
                    sendDataToParent={handleDataFromChild}
                    hideOutput={true}
                    externalOutput={editorOutput}
                    externalSetOutput={setEditorOutput}
                    externalError={editorError}
                    externalSetError={setEditorError}
                    externalIsProcessing={isProcessing}
                    externalSetIsProcessing={setIsProcessing}
                  />
                </div>

                {/* Bottom - Output */}
                <div className={`h-full overflow-hidden flex flex-col ${theme === "dark" ? "bg-[#1e1e1e]" : "bg-white"}`}>
                  <div className={`flex-shrink-0 h-10 flex justify-between items-center px-4 ${theme === "dark" ? "bg-[#333333]" : "bg-gray-100"}`}>
                    <span className={`font-medium text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-800"}`}>Output</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditorOutput(null);
                        setEditorError('');
                      }}
                      className="h-6 text-xs hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      Clear
                    </Button>
                  </div>

                  <div className="flex-grow overflow-auto p-4 font-mono text-sm">
                    {editorError ? (
                      <div className="text-red-500 bg-red-500/10 p-3 rounded-md">
                        {editorError}
                      </div>
                    ) : editorOutput ? (
                      <div>
                        {editorOutput.error ? (
                          <div className="text-red-500 bg-red-500/10 p-3 rounded-md">
                            <p>{editorOutput.message}</p>
                            {editorOutput.details && <p className="mt-1 text-xs opacity-80">{editorOutput.details}</p>}
                          </div>
                        ) : Array.isArray(editorOutput) && editorOutput.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                              <thead>
                                <tr className={theme === 'dark' ? 'bg-[#2B3440]' : 'bg-gray-200'}>
                                  {Object.keys(editorOutput[0]).map((header, index) => (
                                    <th key={index} className="p-2 border-b border-gray-600 font-semibold">{header}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {editorOutput.map((row, rowIndex) => (
                                  <tr key={rowIndex} className={`border-b ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-100'}`}>
                                    {Object.values(row).map((cell, cellIndex) => (
                                      <td key={cellIndex} className="p-2 whitespace-nowrap">
                                        {typeof cell === 'object' ? JSON.stringify(cell) : cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <pre className={`whitespace-pre-wrap ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                            {typeof editorOutput === 'object' ? JSON.stringify(editorOutput, null, 2) : editorOutput}
                          </pre>
                        )}
                      </div>
                    ) : (
                      <div className={`text-center py-8 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`}>
                        Run your code to see the output here
                      </div>
                    )}
                  </div>
                </div>
              </Split>
            </div>
          </Split>
        </div>
      </div>

      {/* VS Popup Dialog */}
      <Dialog open={isVsPopupOpen} onOpenChange={setIsVsPopupOpen}>
        <DialogContent className={`${theme === "dark" ? "bg-[#1E293B] text-white border-gray-700" : "bg-white text-gray-900"}`}>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold mb-6">Matchup</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center gap-8 py-8">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24 border-4 border-teal-500">
                <AvatarImage src={player1Avatar} />
                <AvatarFallback>P1</AvatarFallback>
              </Avatar>
              <span className="font-bold text-lg">{player1Name}</span>
              <span className="text-sm text-teal-500 font-medium">Challenger</span>
            </div>

            <div className="text-3xl font-black text-gray-500">VS</div>

            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24 border-4 border-red-500">
                <AvatarImage src={player2Avatar} />
                <AvatarFallback>P2</AvatarFallback>
              </Avatar>
              <span className="font-bold text-lg">{player2Name}</span>
              <span className="text-sm text-red-500 font-medium">Defender</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {(gameStatus.isWinner || gameStatus.isOpponentWon || gameStatus.isTie) && (
        <Result
          gameStatus={gameStatus}
          playerData={player1Name}
          opponentData={player2Name}
          player1Avatar={player1Avatar}
          player2Avatar={player2Avatar}
          userId={userId}
          challengeType={challengeType}
        />
      )}

      <ConnectionStatusPopup />
    </>
  )
}