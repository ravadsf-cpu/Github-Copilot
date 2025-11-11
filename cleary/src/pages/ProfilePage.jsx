import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { User, Mail, Settings, Shield, Bell, Palette } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const { userPreferences, setUserPreferences } = useApp();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  return (
    <AnimatedBackground mood="optimistic">
      <Header />
      
      <main className="container mx-auto px-6 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Your Profile
          </h1>
          <p className="text-gray-400 text-lg">
            Manage your account settings and preferences
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/30 text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
                  
                  {/* Avatar */}
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-4xl text-white font-bold">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 transition-all"
                      >
                        Change Avatar
                      </motion.button>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 mb-2">Name</label>
                      <input
                        type="text"
                        value={user?.name || ''}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-2">Email</label>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={user?.email || ''}
                          className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                    >
                      Save Changes
                    </motion.button>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Content Preferences</h2>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Palette className="w-5 h-5 mr-2" />
                      Political Balance
                    </h3>
                    <div className="space-y-3">
                      {['balanced', 'challenge', 'reinforce'].map((option) => (
                        <motion.label
                          key={option}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className={`flex items-center space-x-3 p-4 rounded-xl cursor-pointer transition-all ${
                            userPreferences.politicalBalance === option
                              ? 'bg-purple-600/20 border border-purple-500/30'
                              : 'bg-white/5 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <input
                            type="radio"
                            name="politicalBalance"
                            checked={userPreferences.politicalBalance === option}
                            onChange={() =>
                              setUserPreferences({
                                ...userPreferences,
                                politicalBalance: option
                              })
                            }
                            className="w-4 h-4"
                          />
                          <div>
                            <p className="text-white font-medium capitalize">{option}</p>
                            <p className="text-gray-400 text-sm">
                              {option === 'balanced' && 'Show diverse perspectives equally'}
                              {option === 'challenge' && 'Show viewpoints that challenge yours'}
                              {option === 'reinforce' && 'Prioritize content aligned with your views'}
                            </p>
                          </div>
                        </motion.label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Reading Format</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {['Text', 'Video', 'Audio'].map((format) => (
                        <motion.button
                          key={format}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-purple-600/20 hover:border-purple-500/30 hover:text-purple-300 transition-all"
                        >
                          {format}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Privacy & Security</h2>
                  
                  <div className="space-y-4">
                    {[
                      { label: 'Save reading history', description: 'Allow Cleary to track articles you read' },
                      { label: 'Personalized recommendations', description: 'Use AI to suggest content' },
                      { label: 'Share anonymized data', description: 'Help improve Cleary for everyone' }
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div>
                          <p className="text-white font-medium">{item.label}</p>
                          <p className="text-gray-400 text-sm">{item.description}</p>
                        </div>
                        <label className="relative inline-block w-12 h-6">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-12 h-6 bg-gray-700 rounded-full peer peer-checked:bg-purple-600 transition-all"></div>
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-6"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Notification Settings</h2>
                  
                  <div className="space-y-4">
                    {[
                      { label: 'Breaking news alerts', description: 'Get notified about important updates' },
                      { label: 'Daily digest', description: 'Receive a summary of top stories' },
                      { label: 'Personalized recommendations', description: 'Get article suggestions' },
                      { label: 'Social interactions', description: 'Comments and reactions on your activity' }
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div>
                          <p className="text-white font-medium">{item.label}</p>
                          <p className="text-gray-400 text-sm">{item.description}</p>
                        </div>
                        <label className="relative inline-block w-12 h-6">
                          <input type="checkbox" defaultChecked={index < 2} className="sr-only peer" />
                          <div className="w-12 h-6 bg-gray-700 rounded-full peer peer-checked:bg-purple-600 transition-all"></div>
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-6"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </AnimatedBackground>
  );
};

export default ProfilePage;
