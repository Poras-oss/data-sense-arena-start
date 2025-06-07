"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Clock, Zap, Timer, Users, ArrowLeft, Link2, Mail, X, Plus, Sparkles, Info, Copy, Share } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useWebSocketContext } from "@/util/WebsocketProvider"
import { useNavigate } from "react-router-dom"
import { useUser  } from "@clerk/clerk-react"
import { FriendsDialog } from "@/components/FriendsDialog"
import { useNotification } from "../../notifications/NotificationProvider";
import axios from 'axios';

export function GameOptions() {
  const navigate = useNavigate()
  const { socket, isConnected } = useWebSocketContext()
  const { isLoaded, isSignedIn, user } = useUser()
  const { showSuccess, showError, showWarning, showInfo } = useNotification()

  // Game settings states
  const [currentView, setCurrentView] = useState("main")
  const [selectedTime, setSelectedTime] = useState(() => {
    const saved = localStorage.getItem("selectedTime")
    return saved ? Number.parseInt(saved) : 15
  })
  const [selectedGameType, setSelectedGameType] = useState(() => {
    return localStorage.getItem("gameType") || "Bullet Surge"
  })
  const [selectedTopic, setSelectedTopic] = useState(() => {
    return localStorage.getItem("selectedTopic") || "sql"
  })

  // Custom game settings
  const [questionCount, setQuestionCount] = useState(() => {
    const saved = localStorage.getItem("questionCount")
    return saved ? Number.parseInt(saved) : 50
  })
  const [withTimer, setWithTimer] = useState(() => {
    const saved = localStorage.getItem("withTimer")
    return saved ? saved === "true" : true
  })
  const [customTimeLimit, setCustomTimeLimit] = useState(() => {
    return (
      JSON.parse(localStorage.getItem("customTimeLimit")) || {
        days: 8,
        hours: "",
        min: "",
        sec: "",
      }
    )
  })

  // Game lobby states
  const [gameId, setGameId] = useState("")
  const [lobbyStatus, setLobbyStatus] = useState("idle")
  const [selectedSubject, setSelectedSubject] = useState(selectedTopic || "")
  const [alertMessage, setAlertMessage] = useState(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFriendsDialog, setShowFriendsDialog] = useState(false)
  const [userId, setUserId] = useState("default-gamepotion")

  // Search functionality
  const [isSearching, setIsSearching] = useState(false)
  const [searchTime, setSearchTime] = useState(0)
  const [error, setError] = useState("")
  const [userName, setUserName] = useState("No name")
  const [formData, setFormData] = useState({
    subject: selectedSubject,
    difficulty: selectedDifficulty
  })

  const getChallengeType = () => {
    if (selectedGameType === "Bullet Surge") return "Bullet Surge"
    if (selectedGameType === "Rapid Sprint") return "Rapid Sprint"
    return "Bullet Surge"
  }

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setUserName(user.firstName || user.fullName || "No name");
      setUserId(user.id)
    }
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    localStorage.setItem("selectedTime", selectedTime.toString())
    localStorage.setItem("gameType", selectedGameType)
    localStorage.setItem("selectedTopic", selectedTopic)
    localStorage.setItem("questionCount", questionCount.toString())
    localStorage.setItem("withTimer", withTimer.toString())
    localStorage.setItem("customTimeLimit", JSON.stringify(customTimeLimit))
  }, [selectedTime, selectedGameType, selectedTopic, questionCount, withTimer, customTimeLimit])

  useEffect(() => {
    let searchTimer;
    if (isSearching) {
      searchTimer = setInterval(() => {
        setSearchTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(searchTimer);
  }, [isSearching]);

  useEffect(() => {
    if (!socket) return

    const onRoomCreated = (data) => {
      console.log("Room created:", data)
      setLobbyStatus("waiting")
      setGameId(data.gameId)
      setAlertMessage({
        title: "Game Created Successfully!",
        description: "Share the Game ID with your friend to start playing.",
      })
    }

    const onPlayerJoined = (data) => {
      if (data.gameId === gameId) {
        setLobbyStatus("starting")
        setAlertMessage({
          title: "Player Joined!",
          description: "Game starting soon...",
        })
      }
    }

    const onGameStart = async (data) => {
      // if (data.challengeType === 'Bullet Surge' || data.challengeType === 'Rapid Sprint') {
      //   try {
      //     const response = await axios.post('https://server.datasenseai.com/fuel-engine/debit', {
      //       clerkId: userId,
      //       key: 'battle',
      //     }, {
      //       validateStatus: function (status) {
      //         // Handle 404 specifically
      //         return status === 200 || status === 404;
      //       }
      //     });
    
      //     // If we reach here, the request was successful (status 200-299)
      //     if (response.status === 404) {
      //       console.log('Fuel endpoint not found, proceeding without fuel check');
      //       // Continue with game start even if fuel service is down
      //     }
      //   } catch (error) {
      //     console.error('Fuel debit error:', error);
          
      //     // Handle different error scenarios
      //     if (error.response) {
      //       // Server responded with a status code outside 2xx
      //       switch (error.response.status) {
      //         case 401:
      //           showError('Authentication failed. Please login again.');
      //           return;
      //         case 403:
      //           const message = error.response.data?.message || 'Access forbidden';
      //           if (message.includes("requires a")) {
      //             showWarning(`Upgrade required: ${message}`);
      //           } else if (message.includes("reached your limit")) {
      //             showWarning(`Usage limit: ${message}`);
      //           } else if (message.includes("Insufficient fuel")) {
      //             showError(`Fuel error: ${message}`);
      //           } else {
      //             showError(message);
      //           }
      //           return;
      //         case 404:
      //           // If fuel service is down, we'll still allow the game to proceed
      //           console.warn('Fuel service not available, proceeding with game');
      //           break;
      //         default:
      //           showError('Server error occurred. Please try again.');
      //           return;
      //       }
      //     } else if (error.request) {
      //       // Request was made but no response received
      //       console.warn('No response from fuel service, proceeding with game');
      //     } else {
      //       // Something happened in setting up the request
      //       console.error('Fuel debit setup error:', error.message);
      //       showError('Configuration error. Please contact support.');
      //       return;
      //     }
      //   }
      // }

      //here we'll check if user selected both the game type and subject
      if (selectedTopic === "") {
        setError("Please select a subject");
        return;
      }
      if (selectedGameType === "") {
        setError("Please select a game type");
        return;
      }
    
      // Proceed with game navigation regardless of fuel check result
      const botParam = data.isBot ? '&isNexus=true' : '';
      navigate(
        `/challenge?gameId=${data.gameId}&challengeType=${data.challengeType || getChallengeType()}&selectedSubject=${data.subject || selectedSubject}&customTime=${data.customTime || selectedTime}${botParam}`,
        { state: { data } }
      );
    };

    const onError = (data) => {
      setLobbyStatus("idle")
      setError(data.message)
      setAlertMessage({
        title: "Error",
        description: data.message,
      })
      setIsSearching(false)
    }

    socket.on("roomCreated", onRoomCreated)
    socket.on("playerJoined", onPlayerJoined)
    socket.on("gameStart", onGameStart)
    socket.on("error", onError)
    socket.on('searchingForPlayer', (data) => {
      setIsSearching(true)
      setError("")
    })
    socket.on('searchCancelled', () => {
      setIsSearching(false)
      setSearchTime(0)
    })

    return () => {
      socket.off("roomCreated", onRoomCreated)
      socket.off("playerJoined", onPlayerJoined)
      socket.off("gameStart", onGameStart)
      socket.off("error", onError)
      socket.off('searchingForPlayer')
      socket.off('searchCancelled')
    }
  }, [socket, gameId, navigate, selectedSubject, selectedTime, userId])

  const handleCreateGame = () => {
    if (!socket || !isConnected || !selectedSubject) {
      setAlertMessage({
        title: "Error",
        description: "Please fill in all required fields",
      })
      return
    }

    const generatedGameId = "GAME" + Math.random().toString(36).substr(2, 6).toUpperCase()
    setLobbyStatus("creating")

    localStorage.setItem(
      "currentGame",
      JSON.stringify({
        gameId: generatedGameId,
        isHost: true,
        challengeDuration: selectedTime,
        selectedSubject,
        difficulty: selectedDifficulty,
      })
    )

    socket.emit("createRoom", {
      gameId: generatedGameId,
      clerkId: userId,
      subject: selectedSubject,
      challengeType: getChallengeType(),
      challengeDuration: selectedTime,
      difficulty: selectedDifficulty,
      playerName: userName
    })
  }

  const handleJoinGame = () => {
    if (!gameId || !socket || !isConnected || !selectedSubject) {
      setAlertMessage({
        title: "Error",
        description: "Please fill in all required fields",
      })
      return
    }
    
    setLobbyStatus("joining")

    localStorage.setItem(
      "currentGame",
      JSON.stringify({
        gameId,
        isHost: false,
        challengeDuration: selectedTime,
        selectedSubject,
        difficulty: selectedDifficulty,
        playerName: userName
      })
    )

    socket.emit("joinRoom", {
      gameId,
      clerkId: userId,
      subject: selectedSubject,
      difficulty: selectedDifficulty,
      playerName: userName
    })
  }

  const handleSearch = () => {
    setError("")

    // check if user is subscribed from local storage
    const subscriptionStatus = localStorage.getItem("subscriptionStatus");
    if (subscriptionStatus && subscriptionStatus.includes("User not subscribed")) {
      setAlertMessage({
        title: "Subscription Required",
        description: "You need to subscribe to access this feature.",
      });
      return;
    }
    
let difficulty = "medium";

if (selectedGameType === "Bullet Surge") {
  if (selectedTime <= 5) {
    difficulty = "easy";
  } else if (selectedTime >= 15) {
    difficulty = "advanced";
  } else {
    difficulty = "medium";
  }
} else if (selectedGameType === "Rapid Sprint") {
  if (selectedTime <= 30) {
    difficulty = "easy";
  } else if (selectedTime >= 60) {
    difficulty = "advanced";
  } else {
    difficulty = "medium";
  }
}


    setSelectedDifficulty(difficulty)
    setFormData({
      subject: selectedSubject,
      difficulty
    })
    
    socket.emit('findPlayer', {
      subject: selectedSubject,
      difficulty,
      userId,
      playerName: userName,
      time: selectedTime,
      challengeType: selectedGameType,
    })
  }
  
  const handleCancel = () => {
    socket.emit('cancelSearch')
  }

  const handleCopyGameId = () => {
    navigator.clipboard.writeText(gameId)
    setAlertMessage({
      title: "Copied!",
      description: "Game ID copied to clipboard",
    })
  }

  const topics = ["python", "sql", "Non-coding"]

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const renderMainView = () => (
    <div className="space-y-6">
      <button
        onClick={() => setCurrentView("game-options")}
        className="group bg-slate-700/50 hover:bg-slate-700/70 p-4 rounded-xl w-full transition-all duration-300 border border-slate-600/50 hover:border-teal-400/30"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-600/50 rounded-lg">
              <Clock className="w-6 h-6 text-teal-400 group-hover:text-teal-300" />
            </div>
            <div className="text-left">
              <p className="text-sm text-slate-300">Game Mode</p>
              <p className="font-medium">
                {selectedGameType} • {selectedTime} min
              </p>
            </div>
          </div>
          <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-200" />
        </div>
      </button>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setCurrentView("friend")}
          className="bg-slate-700/50 hover:bg-slate-700/70 p-4 rounded-xl flex flex-col items-center gap-2 transition-colors border border-slate-600/50 hover:border-blue-400/30"
        >
          <span className="text-3xl">🎮</span>
          <span className="font-medium">Friendly Match</span>
          <p className="text-xs text-slate-400 text-center">Challenge friends directly</p>
        </button>

        <button 
          onClick={() => setCurrentView("join-game")}
          className="bg-slate-700/50 hover:bg-slate-700/70 p-4 rounded-xl flex flex-col items-center gap-2 transition-colors border border-slate-600/50 hover:border-purple-400/30"
        >
          <Users className="w-8 h-8 text-purple-400" />
          <span className="font-medium">Join Friendly Game</span>
          <p className="text-xs text-slate-400 text-center">Find random opponents</p>
        </button>
      </div>

      <Button 
        onClick={handleSearch}
        disabled={isSearching || !isConnected}
        className="w-full h-14 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-lg font-bold rounded-xl shadow-lg transition-all"
      >
        {isSearching ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white rounded-full animate-spin" />
            Searching ({formatTime(searchTime)})
          </div>
        ) : (
          "⚡ Quick Play"
        )}
      </Button>

      {(error || alertMessage) && (
        <Alert className={`mt-4 border ${error ? 'border-red-400/50' : 'border-teal-400/50'} bg-slate-800/70`}>
          <AlertDescription className="flex items-center gap-2">
            {error ? '⚠️' : 'ℹ️'} {error || alertMessage?.description}
          </AlertDescription>
        </Alert>
      )}

      {isSearching && (
        <Button 
          onClick={handleCancel}
          variant="outline" 
          className="w-full mt-2 border-slate-600 hover:bg-slate-700/50 text-slate-300"
        >
          Cancel Search
        </Button>
      )}
    </div>
  )

  const renderGameOptions = () => (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() => {
              setSelectedTopic(topic)
              setSelectedSubject(topic)
            }}
            className={`px-4 py-2 rounded-full transition-all ${
              selectedTopic === topic 
                ? "bg-teal-500 text-white shadow-md" 
                : "bg-slate-700/50 hover:bg-slate-600/70"
            }`}
          >
            {topic === "python" ? "Python" : topic === "sql" ? "MySQL" : topic}
          </button>
        ))}
      </div>

      {[
        {
          icon: <Zap className="w-6 h-6 text-yellow-400" />,
          title: "Bullet Surge",
          times: [5, 10, 15],
          type: "Bullet Surge",
          desc: "Quick-fire rounds for rapid problem-solving"
        },
        {
          icon: <Timer className="w-6 h-6 text-blue-400" />,
          title: "Rapid Sprint",
          times: [30, 45, 60],
          type: "Rapid Sprint",
          desc: "Longer sessions for in-depth solutions"
        }
      ].map((mode, idx) => (
        <div key={idx} className="bg-slate-700/50 rounded-xl p-5 border border-slate-600/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-600/50 rounded-lg">{mode.icon}</div>
            <div>
              <h3 className="font-semibold text-lg">{mode.title}</h3>
              <p className="text-sm text-slate-400">{mode.desc}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {mode.times.map((time) => (
              <button
                key={time}
                onClick={() => {
                  setSelectedTime(time)
                  setSelectedGameType(mode.type)
                  setCurrentView("main")
                }}
                className={`py-3 rounded-lg transition-all ${
                  selectedTime === time && selectedGameType === mode.type
                    ? 'bg-teal-500 text-white shadow-md ring-2 ring-teal-300'
                    : 'bg-slate-600/50 hover:bg-slate-600/70'
                }`}
              >
                {time} min
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={() => setCurrentView("main")}
        className="w-full py-3 text-slate-300 hover:text-white flex items-center justify-center gap-2 hover:bg-slate-700/50 rounded-xl transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Main
      </button>
    </div>
  )

  const renderFriendView = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <button 
          onClick={() => setCurrentView("main")}
          className="p-2 hover:bg-slate-700/50 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Private Match
        </h2>
      </div>
      
      {alertMessage && (
        <Alert className={`border ${error ? 'border-red-400/50' : 'border-teal-400/50'} bg-slate-800/70`}>
          <AlertDescription>{alertMessage.description}</AlertDescription>
        </Alert>
      )}
      
      <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600/50 space-y-6">
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-slate-300">SELECT TOPIC</h3>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <button
                key={topic}
                onClick={() => {
                  setSelectedTopic(topic)
                  setSelectedSubject(topic)
                }}
                className={`px-4 py-2 rounded-full transition-all ${
                  selectedTopic === topic 
                    ? "bg-teal-500 text-white shadow-md" 
                    : "bg-slate-600/50 hover:bg-slate-600/70"
                }`}
              >
                {topic === "python" ? "Python" : topic === "sql" ? "MySQL" : topic}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-slate-300">DIFFICULTY</h3>
          <div className="grid grid-cols-3 gap-2">
            {["easy", "medium", "advanced"].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`py-2 rounded-lg transition-all ${
                  selectedDifficulty === diff
                    ? "bg-teal-500 text-white shadow-md ring-2 ring-teal-300"
                    : "bg-slate-600/50 hover:bg-slate-600/70"
                }`}
              >
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <Button
        onClick={handleCreateGame}
        className="w-full h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-lg font-bold rounded-xl shadow-lg transition-all"
        disabled={!selectedSubject || lobbyStatus !== "idle" || !isConnected}
      >
        <Clock className="mr-2 h-5 w-5" />
        Create Challenge ({selectedTime} mins)
      </Button>
      
      {lobbyStatus !== "idle" && (
        <div className="bg-slate-700/50 p-5 rounded-xl border border-slate-600/50">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-teal-300">
            <Users className="h-5 w-5" />
            Game Lobby
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Status:</span>
                <span className="font-medium">
                  {lobbyStatus === "waiting" ? "Waiting for opponent..." : "Starting game..."}
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleCopyGameId}
                  className="border-slate-600 hover:bg-slate-700/50"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy ID
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowFriendsDialog(true)}
                  className="border-slate-600 hover:bg-slate-700/50"
                >
                  <Share className="h-4 w-4 mr-1" />
                  Invite
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/40 p-3 rounded-lg">
                <p className="text-xs text-slate-400">Duration</p>
                <p className="font-medium">{selectedTime} minutes</p>
              </div>
              <div className="bg-slate-800/40 p-3 rounded-lg">
                <p className="text-xs text-slate-400">Subject</p>
                <p className="font-medium">
                  {selectedSubject === "python" ? "Python" : selectedSubject === "sql" ? "MySQL" : selectedSubject}
                </p>
              </div>
              <div className="bg-slate-800/40 p-3 rounded-lg">
                <p className="text-xs text-slate-400">Difficulty</p>
                <p className="font-medium">{selectedDifficulty}</p>
              </div>
              <div className="bg-slate-800/40 p-3 rounded-lg">
                <p className="text-xs text-slate-400">Mode</p>
                <p className="font-medium">{selectedGameType}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderJoinGameView = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <button 
          onClick={() => setCurrentView("main")}
          className="p-2 hover:bg-slate-700/50 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Join Friendly Game
        </h2>
      </div>
      
      {alertMessage && (
        <Alert className={`border ${error ? 'border-red-400/50' : 'border-teal-400/50'} bg-slate-800/70`}>
          <AlertDescription>{alertMessage.description}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">GAME ID</label>
          <Input
            type="text"
            placeholder="Enter Game ID"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="bg-slate-700/50 border-slate-600/50 focus:border-teal-400/50"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">TOPIC</label>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <button
                key={topic}
                onClick={() => {
                  setSelectedTopic(topic)
                  setSelectedSubject(topic)
                }}
                className={`px-3 py-1 text-sm rounded-full transition-all ${
                  selectedTopic === topic 
                    ? "bg-teal-500 text-white shadow-md" 
                    : "bg-slate-600/50 hover:bg-slate-600/70"
                }`}
              >
                {topic === "python" ? "Python" : topic === "sql" ? "MySQL" : topic}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">DIFFICULTY</label>
          <div className="grid grid-cols-3 gap-2">
            {["easy", "medium", "advanced"].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`py-2 text-sm rounded-lg transition-all ${
                  selectedDifficulty === diff
                    ? "bg-teal-500 text-white shadow-md ring-2 ring-teal-300"
                    : "bg-slate-600/50 hover:bg-slate-600/70"
                }`}
              >
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <Button
        onClick={handleJoinGame}
        className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-lg font-bold rounded-xl shadow-lg transition-all"
        disabled={!gameId || !selectedSubject || lobbyStatus !== "idle" || !isConnected}
      >
        Join Challenge
      </Button>
      
      {lobbyStatus !== "idle" && (
        <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600/50">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-800/40 p-2 rounded-lg">
              <p className="text-xs text-slate-400">Status</p>
              <p>{lobbyStatus === "joining" ? "Joining..." : "Starting..."}</p>
            </div>
            <div className="bg-slate-800/40 p-2 rounded-lg">
              <p className="text-xs text-slate-400">Game ID</p>
              <p className="truncate">{gameId || "N/A"}</p>
            </div>
            <div className="bg-slate-800/40 p-2 rounded-lg">
              <p className="text-xs text-slate-400">Subject</p>
              <p>
                {selectedSubject === "python" ? "Python" : selectedSubject === "sql" ? "MySQL" : selectedSubject}
              </p>
            </div>
            <div className="bg-slate-800/40 p-2 rounded-lg">
              <p className="text-xs text-slate-400">Difficulty</p>
              <p>{selectedDifficulty}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 rounded-xl shadow-2xl overflow-hidden">
      <div className="p-6 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-[#2dd4bf] bg-clip-text text-transparent">
            BATTLE GROUND
          </h1>
          <p className="text-slate-400 text-sm">
            {isConnected ? "Connected 🟢" : "Connecting..."}
          </p>
        </div>

        <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 shadow-inner border border-slate-700/50">
          {currentView === "main" && renderMainView()}
          {currentView === "game-options" && renderGameOptions()}
          {currentView === "friend" && renderFriendView()}
          {currentView === "join-game" && renderJoinGameView()}
        </div>

        <div className="text-center text-sm text-slate-400 space-x-4">
          <span>👥 {userName}</span>
          <span>⚡ {selectedTime}min</span>
          <span>📚 {selectedSubject}</span>
        </div>
      </div>

      <FriendsDialog
        open={showFriendsDialog}
        onOpenChange={setShowFriendsDialog}
        gameId={gameId}
        selectedSubject={selectedSubject}
        selectedDifficulty={selectedDifficulty}
        challengeType={selectedGameType}
        customTime={selectedTime}
      />
    </div>
  )
}