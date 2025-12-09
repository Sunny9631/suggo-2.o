import React, { useState, useEffect, useRef } from 'react';
import { useCall } from '../context/CallContext';
import { useTheme } from '../context/ThemeContext';

const CallPage = () => {
  const { activeCall, isInCall, endCall, toggleMute, toggleSpeaker, toggleVideo, isMuted, isSpeakerOn, localStream, remoteStream } = useCall();
  const { theme } = useTheme();
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // Update video state based on local stream
  useEffect(() => {
    if (localStream && activeCall?.type === 'video') {
      const videoTrack = localStream.getVideoTracks()[0];
      setIsVideoOff(!videoTrack?.enabled);
    }
  }, [localStream, activeCall?.type]);

  // Handle call duration
  useEffect(() => {
    let interval;
    if (isInCall && activeCall?.startTime) {
      interval = setInterval(() => {
        const duration = Math.floor((Date.now() - new Date(activeCall.startTime)) / 1000);
        setCallDuration(duration);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInCall, activeCall]);

  // Handle local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      console.log('Setting local video stream:', localStream);
      console.log('Local video tracks:', localStream.getVideoTracks());
      console.log('Local audio tracks:', localStream.getAudioTracks());
      
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        console.log('Local video track state:', {
          enabled: videoTrack.enabled,
          readyState: videoTrack.readyState,
          muted: videoTrack.muted
        });
        
        // Ensure video track is enabled for video calls
        if (activeCall?.type === 'video' && !videoTrack.enabled) {
          videoTrack.enabled = true;
          console.log('Enabled local video track');
        }
      }
      
      localVideoRef.current.srcObject = localStream;
      
      // Force play the video
      localVideoRef.current.play().catch(err => {
        console.log('Local video play error:', err);
      });
      
      // Verify the video element
      console.log('Local video element:', localVideoRef.current);
      console.log('Local video srcObject:', localVideoRef.current.srcObject);
    } else {
      console.log('Local video setup failed:', {
        hasRef: !!localVideoRef.current,
        hasStream: !!localStream
      });
    }
  }, [localStream, activeCall?.type]);

  // Handle remote video stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      console.log('Setting remote video stream:', remoteStream);
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(err => {
        console.log('Remote video play error:', err);
      });
    }
  }, [remoteStream]);

  if (!isInCall || !activeCall) return null;

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getOtherUser = () => {
    return activeCall.receiverId._id === activeCall.callerId?._id 
      ? activeCall.callerId 
      : activeCall.receiverId;
  };

  const handleEndCall = async () => {
    try {
      await endCall(activeCall._id);
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  const handleToggleVideo = () => {
    console.log('Toggle video called, current isVideoOff:', isVideoOff);
    toggleVideo();
    setIsVideoOff(!isVideoOff);
  };

  const otherUser = getOtherUser();

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 z-50 flex flex-col">
      {/* Main Video Area */}
      <div className="flex-1 relative">
        {activeCall?.type === 'video' ? (
          <>
            {/* Remote Video (Full Screen) */}
            <div className="absolute inset-0 bg-black">
              <video 
                ref={remoteVideoRef}
                autoPlay={true}
                playsInline={true}
                className="w-full h-full object-cover"
              />
              {/* Fallback when no remote video */}
              {!remoteStream && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="text-center">
                    {otherUser?.avatarUrl ? (
                      <img 
                        src={otherUser.avatarUrl} 
                        alt={otherUser.displayName || otherUser.username}
                        className="w-40 h-40 rounded-full object-cover mx-auto mb-4 border-4 border-gray-700"
                      />
                    ) : (
                      <div className="w-40 h-40 rounded-full bg-gray-700 mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className="text-white text-xl font-semibold">
                      {otherUser?.displayName || otherUser?.username || 'Unknown'}
                    </div>
                    <div className="text-gray-400 text-sm mt-2">
                      Connecting...
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Local Video (Small Overlay) */}
            <div className="absolute top-6 right-6 w-32 h-32 bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-700">
              <video 
                ref={localVideoRef}
                muted={true}
                autoPlay={true}
                playsInline={true}
                className="w-full h-full object-cover"
              />
              {isVideoOff && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Audio Call UI */
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center">
              {otherUser?.avatarUrl ? (
                <img 
                  src={otherUser.avatarUrl} 
                  alt={otherUser.displayName || otherUser.username}
                  className="w-48 h-48 rounded-full object-cover mx-auto mb-6 border-4 border-gray-700 shadow-2xl"
                />
              ) : (
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 mx-auto mb-6 flex items-center justify-center shadow-2xl">
                  <svg className="w-24 h-24 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              <h2 className="text-3xl font-bold text-white mb-2">
                {otherUser?.displayName || otherUser?.username || 'Unknown'}
              </h2>

              <div className="text-gray-400 text-lg mb-8">
                {activeCall?.type === 'audio' ? 'Audio Call' : 'Video Call'} • {formatDuration(callDuration)}
              </div>

              {/* Audio Visualizer */}
              <div className="flex items-center justify-center gap-2 mb-12">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-blue-500 rounded-full animate-pulse"
                    style={{
                      height: `${15 + Math.random() * 25}px`,
                      animationDelay: `${i * 0.15}s`,
                      minHeight: '20px'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Call Info Overlay */}
        <div className="absolute top-6 left-6 text-white">
          <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg px-4 py-2">
            <h2 className="text-xl font-semibold">
              {otherUser?.displayName || otherUser?.username || 'Unknown'}
            </h2>
            <div className="text-sm opacity-75">
              {activeCall?.type === 'audio' ? 'Audio Call' : 'Video Call'} • {formatDuration(callDuration)}
            </div>
          </div>
        </div>
      </div>

      {/* Call Controls */}
      <div className="bg-gradient-to-t from-black via-gray-900 to-transparent p-8">
        <div className="flex justify-center items-center gap-6">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`p-5 rounded-full transition-all transform hover:scale-110 ${
              isMuted 
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/50' 
                : 'bg-gray-700 text-white hover:bg-gray-600 shadow-lg'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* Speaker Button */}
          <button
            onClick={toggleSpeaker}
            className={`p-5 rounded-full transition-all transform hover:scale-110 ${
              !isSpeakerOn 
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/50' 
                : 'bg-gray-700 text-white hover:bg-gray-600 shadow-lg'
            }`}
            title={isSpeakerOn ? 'Speaker Off' : 'Speaker On'}
          >
            {isSpeakerOn ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L14.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* Video Toggle - Only for video calls */}
          {activeCall?.type === 'video' && (
            <button
              onClick={handleToggleVideo}
              className={`p-5 rounded-full transition-all transform hover:scale-110 ${
                isVideoOff 
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/50' 
                  : 'bg-gray-700 text-white hover:bg-gray-600 shadow-lg'
              }`}
              title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
            >
              {isVideoOff ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              )}
            </button>
          )}

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="p-5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all transform hover:scale-110 shadow-lg shadow-red-500/50"
            title="End Call"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallPage;
