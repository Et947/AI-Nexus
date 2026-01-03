import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, ScrollView, 
  TextInput, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, 
  Dimensions, Modal, Alert, Keyboard, Image, ActivityIndicator 
} from 'react-native';

// --- NEW IMPORTS (Camera & AI) ---
import * as ImagePicker from 'expo-image-picker';
import { GoogleGenerativeAI } from "@google/generative-ai";

import { 
  Menu, Mic, Paperclip, ArrowUp, ChevronDown, 
  MessageSquare, Image as ImageIcon, Code, LayoutTemplate, 
  X, ArrowLeft, FileText, AudioLines, Zap, Settings,
  PenTool, Instagram, Mail, CloudUpload, Play, Download, Check, Copy,
  Eye, ScanEye 
} from 'lucide-react-native';

export default function App() {

  // --- 1. SETUP API & STATE ---
  
  // 🔑 YAHAN APNI API KEY DALEIN
  const GEMINI_API_KEY = "YAHAN_APNI_KEY_PASTE_KAREIN"; 
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  const [currentView, setCurrentView] = useState('home'); 
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [isModelDropdownVisible, setModelDropdownVisible] = useState(false);
  const [selectedModel, setSelectedModel] = useState('GPT-4 Omni');
  const [inputText, setInputText] = useState('');
  
  const [chatHistory, setChatHistory] = useState([
    { id: 1, text: "Hello! I am AI Nexus. How can I assist you?", sender: 'ai' }
  ]);

  // --- VISION STATE ---
  const [visionImage, setVisionImage] = useState(null);
  const [visionResult, setVisionResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const scrollViewRef = useRef();

  const models = [
    { id: '1', name: 'GPT-4 Omni', icon: '⚡' },
    { id: '2', name: 'Claude 3.5', icon: '🧠' },
    { id: '3', name: 'Gemini 3.0 (Vision)', icon: '👁️' },
  ];

  const navigateTo = (view) => {
    setCurrentView(view);
    setSidebarVisible(false);
  };

  const handleSend = () => {
    if (inputText.trim().length === 0) return;
    const userMsg = { id: Date.now(), text: inputText, sender: 'user' };
    setChatHistory([...chatHistory, userMsg]);
    setInputText(''); 
    Keyboard.dismiss(); 
    setTimeout(() => {
      setChatHistory(prev => [...prev, { id: Date.now()+1, text: "This is a simulated AI response.", sender: 'ai' }]);
    }, 1000);
  };

  // --- 2. VISION CAMERA LOGIC ---
  const handleVisionCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setVisionImage(result.assets[0].uri);
      analyzeImageWithGemini(result.assets[0].base64);
    }
  };

  const analyzeImageWithGemini = async (base64Image) => {
    setIsLoading(true);
    setVisionResult("Analyzing visual data...");
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = "Act as an AI Vision Assistant. Analyze this image. If it's code/UI, provide the code. If it's an object, explain how to fix or use it. Keep it concise.";
      const imagePart = { inlineData: { data: base64Image, mimeType: "image/jpeg" } };
      
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      setVisionResult(response.text());
    } catch (error) {
      setVisionResult("Error: " + error.message + "\n(Check API Key)");
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER SIDEBAR ---
  const renderSidebar = () => (
    <Modal visible={isSidebarVisible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.sidebarContainer}>
          <View style={styles.sidebarHeader}>
            <View style={styles.logoRow}>
              <View style={styles.logoIcon}><Text style={styles.logoIconText}>AI</Text></View>
              <Text style={styles.logoText}>AI NEXUS</Text>
            </View>
            <TouchableOpacity onPress={() => setSidebarVisible(false)}>
              <X color="#666" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.sidebarContent}>
            <Text style={styles.sidebarLabel}>CORE</Text>
            
            <TouchableOpacity style={[styles.sidebarItem, currentView === 'chat' && styles.sidebarActive]} onPress={() => navigateTo('chat')}>
              {currentView === 'chat' && <View style={styles.activeIndicator} />}
              <MessageSquare size={20} color={currentView === 'chat' ? "#ccff00" : "#888"} />
              <Text style={[styles.sidebarText, currentView === 'chat' && {color: '#ccff00'}]}>Chat & Actions</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.sidebarItem, currentView === 'vision' && styles.sidebarActive]} onPress={() => navigateTo('vision')}>
              {currentView === 'vision' && <View style={styles.activeIndicator} />}
              <Eye size={20} color={currentView === 'vision' ? "#ccff00" : "#888"} />
              <Text style={[styles.sidebarText, currentView === 'vision' && {color: '#ccff00'}]}>Vision Camera</Text>
            </TouchableOpacity>

            <Text style={styles.sidebarLabel}>CREATE</Text>

            <TouchableOpacity style={[styles.sidebarItem, currentView === 'templates' && styles.sidebarActive]} onPress={() => navigateTo('templates')}>
              {currentView === 'templates' && <View style={styles.activeIndicator} />}
              <LayoutTemplate size={20} color={currentView === 'templates' ? "#ccff00" : "#888"} />
              <Text style={[styles.sidebarText, currentView === 'templates' && {color: '#ccff00'}]}>Templates</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.sidebarItem, currentView === 'pdf' && styles.sidebarActive]} onPress={() => navigateTo('pdf')}>
              {currentView === 'pdf' && <View style={styles.activeIndicator} />}
              <FileText size={20} color={currentView === 'pdf' ? "#ccff00" : "#888"} />
              <Text style={[styles.sidebarText, currentView === 'pdf' && {color: '#ccff00'}]}>PDF to Ask</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.sidebarItem, currentView === 'image' && styles.sidebarActive]} onPress={() => navigateTo('image')}>
              {currentView === 'image' && <View style={styles.activeIndicator} />}
              <ImageIcon size={20} color={currentView === 'image' ? "#ccff00" : "#888"} />
              <Text style={[styles.sidebarText, currentView === 'image' && {color: '#ccff00'}]}>Text to Image</Text>
            </TouchableOpacity>

            <Text style={styles.sidebarLabel}>TOOLS</Text>

            <TouchableOpacity style={[styles.sidebarItem, currentView === 'code' && styles.sidebarActive]} onPress={() => navigateTo('code')}>
              {currentView === 'code' && <View style={styles.activeIndicator} />}
              <Code size={20} color={currentView === 'code' ? "#ccff00" : "#888"} />
              <Text style={[styles.sidebarText, currentView === 'code' && {color: '#ccff00'}]}>Code Expert</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.sidebarItem, currentView === 'voice' && styles.sidebarActive]} onPress={() => navigateTo('voice')}>
              {currentView === 'voice' && <View style={styles.activeIndicator} />}
              <AudioLines size={20} color={currentView === 'voice' ? "#ccff00" : "#888"} />
              <Text style={[styles.sidebarText, currentView === 'voice' && {color: '#ccff00'}]}>Text to Voice</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.sidebarItem, currentView === 'upgrade' && styles.sidebarActive]} onPress={() => navigateTo('upgrade')}>
              {currentView === 'upgrade' && <View style={styles.activeIndicator} />}
              <Zap size={20} color={currentView === 'upgrade' ? "#ccff00" : "#888"} />
              <Text style={[styles.sidebarText, currentView === 'upgrade' && {color: '#ccff00'}]}>Upgrade Plan</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.sidebarFooter}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
              <View style={styles.userAvatar}><Text style={{color:'black', fontWeight:'bold'}}>US</Text></View>
              <View>
                <Text style={styles.userName}>AI Nexus</Text>
                <Text style={styles.userPlan}>Premium User</Text>
              </View>
            </View>
            <Settings size={20} color="#666" />
          </View>
        </View>
        <TouchableOpacity style={{flex:1}} onPress={() => setSidebarVisible(false)} />
      </View>
    </Modal>
  );

  // --- 1. RENDER HOME ---
  const renderHome = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.greetingBox}>
        <Text style={styles.greetingText}>Hello, <Text style={{color: 'white', fontWeight:'bold'}}>AI Nexus</Text> 👋</Text>
        <Text style={styles.subGreeting}>How may I help you today?</Text>
      </View>
      <View style={styles.gridContainer}>
        <TouchableOpacity style={styles.bigCard} onPress={() => navigateTo('vision')}>
          <View style={styles.topIconRow}>
            <View style={styles.iconCircle}><ScanEye color="black" size={20}/></View>
            <ArrowUp style={{transform:[{rotate:'45deg'}]}} color="black" size={20} />
          </View>
          <View>
            <Text style={styles.bigCardTitle}>Vision</Text>
            <Text style={styles.bigCardTitle}>Camera AI</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.rightColumn}>
          <TouchableOpacity style={[styles.smallCard, {backgroundColor: '#d8b4fe'}]} onPress={() => navigateTo('chat')}>
            <MessageSquare color="black" size={20} />
            <Text style={styles.smallCardText}>Chat with AI</Text>
            <View style={{flex:1, alignItems:'flex-end'}}><ArrowUp style={{transform:[{rotate:'-45deg'}]}} color="black" size={16} /></View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.smallCard, {backgroundColor: '#fbcfe8'}]} onPress={() => navigateTo('image')}>
            <ImageIcon color="black" size={20} />
            <Text style={styles.smallCardText}>Text to Image</Text>
            <View style={{flex:1, alignItems:'flex-end'}}><ArrowUp style={{transform:[{rotate:'-45deg'}]}} color="black" size={16} /></View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  // --- 2. RENDER CHAT ---
  const renderChat = () => (
    <ScrollView ref={scrollViewRef} contentContainerStyle={{padding: 20, paddingBottom: 100}}>
      {chatHistory.map((msg, idx) => (
        <View key={idx} style={[styles.msgBubble, msg.sender === 'user' ? styles.msgUser : styles.msgAi]}>
          <Text style={{color: msg.sender === 'user' ? 'white' : 'black', fontSize:16, lineHeight: 22}}>{msg.text}</Text>
        </View>
      ))}
    </ScrollView>
  );

  // --- 3. RENDER VISION ---
  const renderVision = () => (
    <View style={{flex: 1, padding: 20, alignItems: 'center'}}>
      <Text style={styles.pageCenterTitle}>AI Vision Eye</Text>
      <Text style={styles.pageCenterSub}>Real-time Object & Code Analysis</Text>

      {/* Camera Trigger Area */}
      <TouchableOpacity onPress={handleVisionCamera} style={{
        width: '100%', height: 350, backgroundColor: '#0a0a0a', 
        borderRadius: 20, borderWidth: 1, borderColor: '#ccff00',
        alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
      }}>
        {visionImage ? (
          <Image source={{ uri: visionImage }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
        ) : (
          <View style={{alignItems:'center'}}>
             <View style={{width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#ccff00', alignItems:'center', justifyContent:'center', marginBottom: 20}}>
                <View style={{width: 80, height: 80, borderRadius: 40, backgroundColor: '#ccff00', opacity: 0.2}} />
                <ScanEye color="#ccff00" size={40} style={{position:'absolute'}} />
             </View>
            <Text style={{color: '#ccff00', fontWeight: 'bold', fontSize: 18}}>Tap to Scan</Text>
            <Text style={{color: '#666', fontSize: 12, marginTop: 5}}>Powered by Gemini 3</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Result Area */}
      <ScrollView style={{
        marginTop: 20, width: '100%', backgroundColor: '#111', 
        borderRadius: 15, padding: 15, borderWidth: 1, borderColor: '#333'
      }}>
        <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom: 10}}>
           <Text style={{color: '#888', fontSize: 12, fontWeight:'bold'}}>AI ANALYSIS</Text>
           {visionResult ? <Copy size={14} color="#ccff00" /> : null}
        </View>
        
        {isLoading ? (
          <View style={{flexDirection:'row', alignItems:'center', gap: 10}}>
             <ActivityIndicator color="#ccff00" />
             <Text style={{color: '#ccff00'}}>Processing visual data...</Text>
          </View>
        ) : (
          <Text style={{color: 'white', fontSize: 16, lineHeight: 24}}>
            {visionResult || "Take a photo of code, UI sketches, or objects to get instant AI analysis."}
          </Text>
        )}
      </ScrollView>
    </View>
  );

  // --- 4. RENDER TEMPLATES ---
  const renderTemplates = () => (
    <ScrollView contentContainerStyle={{padding: 20}}>
      <Text style={styles.pageTitle}>Content Templates</Text>
      <TouchableOpacity style={styles.templateCard}>
        <View style={[styles.templateIconBox, {backgroundColor: '#1e3a8a'}]}> 
          <PenTool color="#60a5fa" size={24} /> 
        </View>
        <View style={{marginTop: 15}}>
          <Text style={styles.templateTitle}>Blog Writer</Text>
          <Text style={styles.templateDesc}>Generate SEO optimized articles in seconds.</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.templateCard}>
        <View style={[styles.templateIconBox, {backgroundColor: '#500724'}]}>
          <Instagram color="#f472b6" size={24} />
        </View>
        <View style={{marginTop: 15}}>
          <Text style={styles.templateTitle}>Social Post</Text>
          <Text style={styles.templateDesc}>Engaging captions for Instagram & Twitter.</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.templateCard}>
        <View style={[styles.templateIconBox, {backgroundColor: '#431407'}]}>
          <Mail color="#fb923c" size={24} />
        </View>
        <View style={{marginTop: 15}}>
          <Text style={styles.templateTitle}>Email Writer</Text>
          <Text style={styles.templateDesc}>Professional emails that get replies.</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );

  // --- 5. RENDER PDF ---
  const renderPDF = () => (
    <View style={{flex:1, padding: 20, alignItems: 'center', justifyContent:'center'}}>
      <Text style={styles.pageCenterTitle}>PDF Question Asker</Text>
      <Text style={styles.pageCenterSub}>Upload a document and ask anything about it</Text>
      <TouchableOpacity style={styles.uploadZone}>
        <View style={styles.uploadCircle}>
          <CloudUpload color="#60a5fa" size={32} />
        </View>
        <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 15}}>Drop your PDF here</Text>
        <Text style={{color: '#666', fontSize: 13, marginTop: 5}}>or click to browse files</Text>
        <TouchableOpacity style={styles.uploadBtn}>
          <Text style={{color: 'white', fontWeight: 'bold'}}>Select File</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );

  // --- 6. RENDER IMAGE ---
  const renderImage = () => (
    <View style={{flex:1, padding: 20}}>
      <View style={{alignItems:'center', marginBottom: 20}}>
        <Text style={styles.pageCenterTitle}>Text to Image Generator</Text>
        <Text style={styles.pageCenterSub}>Transform text into stunning visuals</Text>
      </View>
      <View style={styles.imagePlaceholder}>
        <ImageIcon color="#333" size={60} />
        <Text style={{color: '#333', marginTop: 15}}>Enter a prompt below to start</Text>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios'?'padding':'height'} style={{marginTop: 20}}>
        <View style={styles.imageInputWrapper}>
          <TextInput 
            style={{flex: 1, color: '#888', height: 50, paddingHorizontal: 15}}
            placeholder="A cyberpunk robot in neon rain..."
            placeholderTextColor="#555"
            underlineColorAndroid="transparent"
          />
          <TouchableOpacity style={styles.generateBtn}>
            <Text style={{color: 'black', fontWeight: 'bold'}}>Generate</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );

  // --- 7. RENDER CODE ---
  const renderCode = () => (
    <View style={{flex: 1}}>
      <ScrollView contentContainerStyle={{padding: 20}}>
        <Text style={styles.pageTitle}>Code Expert</Text>
        <Text style={styles.pageSubTitle}>Python, JS, HTML debugger</Text>
        <View style={styles.codeBlock}>
          <View style={styles.codeHeader}>
            <Text style={{color: '#4ade80', fontSize: 12, fontWeight: 'bold'}}>script.js</Text>
            <TouchableOpacity style={{flexDirection:'row', alignItems:'center', gap:5}}>
              <Copy size={14} color="#888" />
              <Text style={{color: '#888', fontSize: 12}}>Copy</Text>
            </TouchableOpacity>
          </View>
          <View style={{padding: 15}}>
            <Text style={{color: '#d484d4', fontFamily: Platform.OS==='ios'?'Menlo':'monospace'}}>function</Text> 
            <Text style={{color: '#60a5fa', fontFamily: Platform.OS==='ios'?'Menlo':'monospace'}}> initAI</Text>
            <Text style={{color: 'white', fontFamily: Platform.OS==='ios'?'Menlo':'monospace'}}>() {'{'}</Text>
            <Text style={{color: 'white', fontFamily: Platform.OS==='ios'?'Menlo':'monospace', marginLeft: 15}}>...</Text>
            <Text style={{color: 'white', fontFamily: Platform.OS==='ios'?'Menlo':'monospace'}}>{'}'}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  // --- 8. RENDER VOICE (FIXED PATH) ---
  const renderVoice = () => (
    <ScrollView contentContainerStyle={{padding: 20, flexGrow: 1, alignItems: 'center'}}>
      
      <View style={{alignItems:'center', marginBottom: 20}}>
        <Text style={[styles.pageCenterTitle, {color: '#fb923c'}]}>Voice Mode</Text>
        <Text style={styles.pageCenterSub}>AI Nexus is listening...</Text>
      </View>

      {/* ✅ CORRECTED PATH: ../../assets/orb.gif */}
      <View style={{
        width: 300, height: 300, 
        justifyContent: 'center', alignItems: 'center', 
        marginBottom: 30
      }}>
        <Image 
          source={require('../../assets/images/orb.gif')}
          style={{width: 300, height: 300}} 
          resizeMode="contain" 
        />
      </View>

      {/* Voice Controls */}
      <View style={styles.voiceCard}>
        <TextInput 
          style={styles.voiceInput}
          placeholder="Type here or speak..."
          placeholderTextColor="#666"
          multiline
          textAlignVertical="top"
        />
        <View style={styles.voiceFooter}>
          <View style={{flexDirection:'row', gap: 15}}>
            <TouchableOpacity style={[styles.playBtn, {width: 50, height: 50, borderRadius: 25}]}>
              <Play fill="#fb923c" color="#fb923c" size={24} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.downloadBtn, {width: 50, height: 50, borderRadius: 25}]}>
              <Mic color="white" size={24} />
            </TouchableOpacity>
          </View>
          <Text style={{color:'#666', fontSize:12}}>Ready</Text>
        </View>
      </View>
    </ScrollView>
  );

  // --- 9. RENDER UPGRADE ---
  const renderUpgrade = () => (
    <ScrollView contentContainerStyle={{padding: 20}}>
      <View style={{alignItems:'center', marginBottom: 30}}>
        <Text style={styles.pageCenterTitle}>Upgrade Plan</Text>
        <Text style={styles.pageCenterSub}>Unlock the full power of AI Nexus</Text>
      </View>
      <View style={styles.planCard}>
        <Text style={styles.planName}>Free Starter</Text>
        <View style={{flexDirection:'row', alignItems:'flex-end', marginVertical: 10}}>
          <Text style={{fontSize: 32, fontWeight:'bold', color:'white'}}>$0</Text>
          <Text style={{fontSize: 14, color:'#888', marginBottom: 5}}>/mo</Text>
        </View>
        <View style={styles.featureRow}><Check size={16} color="#4ade80" /><Text style={styles.featureText}>GPT-3.5 Only</Text></View>
        <View style={styles.featureRow}><Check size={16} color="#4ade80" /><Text style={styles.featureText}>10 Chats / day</Text></View>
        <TouchableOpacity style={styles.currentPlanBtn}>
          <Text style={{color: 'white', fontWeight: 'bold'}}>Current Plan</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.proCard}>
        <View style={{flexDirection:'row', justifyContent:'space-between'}}>
          <Text style={{color: 'black', fontWeight: 'bold', fontSize: 18}}>Pro Unlimited</Text>
          <Zap fill="#d9f99d" color="transparent" size={60} style={{position:'absolute', right:0, top:-10, opacity: 0.4}} />
        </View>
        <View style={{flexDirection:'row', alignItems:'flex-end', marginVertical: 10}}>
          <Text style={{fontSize: 32, fontWeight:'bold', color:'black'}}>$19</Text>
          <Text style={{fontSize: 14, color:'#444', marginBottom: 5}}>/mo</Text>
        </View>
        <View style={styles.featureRow}><Check size={16} color="black" /><Text style={{color:'black', marginLeft: 10}}>Gemini 2.5 Pro</Text></View>
        <View style={styles.featureRow}><Check size={16} color="black" /><Text style={{color:'black', marginLeft: 10}}>Unlimited Image Gen</Text></View>
        <View style={styles.featureRow}><Check size={16} color="black" /><Text style={{color:'black', marginLeft: 10}}>Text to Voice</Text></View>
        <TouchableOpacity style={styles.upgradeBtn}>
          <Text style={{color: '#ccff00', fontWeight: 'bold'}}>Upgrade Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      {renderSidebar()}

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => setSidebarVisible(true)}>
            <Menu color="white" size={24} />
          </TouchableOpacity>
          <View style={{position: 'relative', zIndex: 10}}>
            <TouchableOpacity style={styles.modelSelector} onPress={() => setModelDropdownVisible(!isModelDropdownVisible)}>
              <View style={styles.neonDot} />
              <Text style={styles.modelText}>{selectedModel}</Text>
              <ChevronDown color="#666" size={14} />
            </TouchableOpacity>
            {isModelDropdownVisible && (
              <View style={styles.dropdownContainer}>
                {models.map((m) => (
                  <TouchableOpacity key={m.id} style={styles.dropdownItem} onPress={() => { setSelectedModel(m.name); setModelDropdownVisible(false); }}>
                    <Text style={{marginRight: 10}}>{m.icon}</Text>
                    <Text style={styles.dropdownText}>{m.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* MAIN CONTENT AREA */}
      <View style={{flex: 1}}>
        {currentView === 'home' && renderHome()}
        {currentView === 'chat' && renderChat()}
        {currentView === 'vision' && renderVision()} 
        {currentView === 'templates' && renderTemplates()}
        {currentView === 'pdf' && renderPDF()}
        {currentView === 'image' && renderImage()}
        {currentView === 'code' && renderCode()}
        {currentView === 'voice' && renderVoice()} 
        {currentView === 'upgrade' && renderUpgrade()}
      </View>

      {/* BOTTOM INPUT BAR */}
      {(currentView === 'chat' || currentView === 'code') && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 10}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.attachBtn}><Paperclip color="#888" size={22} /></TouchableOpacity>
            <TextInput 
              style={styles.textInput}
              placeholder="Ask anything..."
              placeholderTextColor="#666"
              value={inputText}
              onChangeText={setInputText}
              multiline={true}
              textAlignVertical="center"
              underlineColorAndroid="transparent"
              selectionColor="#ccff00"
            />
            <View style={styles.rightInputIcons}>
              {inputText.length === 0 && <TouchableOpacity><Mic color="#888" size={22} /></TouchableOpacity>}
              <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                <ArrowUp color="black" size={24} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  // Header
  header: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuBtn: { padding: 8, backgroundColor: '#111', borderRadius: 12 },
  modelSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 20, gap: 8, borderWidth: 1, borderColor: '#222' },
  neonDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ccff00' },
  modelText: { color: 'white', fontWeight: '600', fontSize: 13 },
  dropdownContainer: { position: 'absolute', top: 50, left: 0, width: 200, backgroundColor: '#161616', borderRadius: 15, padding: 10, borderWidth: 1, borderColor: '#333', shadowColor: '#000', shadowOpacity: 0.5, elevation: 10 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  dropdownText: { color: 'white', fontSize: 14 },

  // Sidebar
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', flexDirection: 'row' },
  sidebarContainer: { width: 'auto', maxWidth: 260, minWidth: 240, backgroundColor: '#0a0a0a', padding: 20, height: '100%', borderRightWidth: 1, borderRightColor: '#222' },
  sidebarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, marginTop: 10 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoIcon: { width: 32, height: 32, backgroundColor: '#ccff00', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  logoIconText: { fontWeight: 'bold', color: 'black' },
  logoText: { color: '#ccff00', fontWeight: 'bold', fontSize: 18 },
  sidebarContent: { flex: 1 },
  sidebarLabel: { color: '#444', fontSize: 11, fontWeight: 'bold', marginBottom: 10, marginTop: 20 },
  sidebarItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 10, borderRadius: 10 },
  sidebarActive: { backgroundColor: '#161616', paddingLeft: 10 },
  activeIndicator: { position: 'absolute', left: 0, top: 10, bottom: 10, width: 3, height: 24, backgroundColor: '#ccff00', borderRadius: 2 },
  sidebarText: { color: '#888', fontSize: 15, fontWeight: '500' },
  sidebarFooter: { borderTopWidth: 1, borderTopColor: '#222', paddingTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  userAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ccff00', alignItems: 'center', justifyContent: 'center' },
  userName: { color: 'white', fontWeight: 'bold' },
  userPlan: { color: '#ccff00', fontSize: 12 },

  // Shared Styles
  pageTitle: { color: '#ccff00', fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  pageSubTitle: { color: '#666', fontSize: 14, marginBottom: 20 },
  pageCenterTitle: { color: '#60a5fa', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  pageCenterSub: { color: '#666', fontSize: 14, textAlign: 'center', marginBottom: 30 },

  // Home Screen
  scrollContent: { padding: 20 },
  greetingBox: { marginBottom: 25 },
  greetingText: { color: '#888', fontSize: 28, marginTop: 10 },
  subGreeting: { color: '#555', fontSize: 24, fontWeight: '600', marginTop: 5 },
  gridContainer: { flexDirection: 'row', gap: 12, height: 180, marginBottom: 30 },
  bigCard: { flex: 1.3, backgroundColor: '#ccff00', borderRadius: 24, padding: 20, justifyContent: 'space-between' },
  topIconRow: { flexDirection: 'row', justifyContent: 'space-between' },
  iconCircle: { width: 40, height: 40, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  bigCardTitle: { fontSize: 22, fontWeight: '800', color: 'black', lineHeight: 26 },
  rightColumn: { flex: 1, gap: 12 },
  smallCard: { flex: 1, borderRadius: 20, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 8 },
  smallCardText: { fontSize: 13, fontWeight: '700', color: 'black', flex: 2 },

  // Chat
  msgBubble: { padding: 15, borderRadius: 20, marginVertical: 8, maxWidth: '80%' },
  msgUser: { alignSelf: 'flex-end', backgroundColor: '#222', borderWidth:1, borderColor:'#333', borderBottomRightRadius: 4 },
  msgAi: { alignSelf: 'flex-start', backgroundColor: '#ccff00', borderTopLeftRadius: 4 },
  inputWrapper: { margin: 15, flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 35, paddingVertical: 5, paddingHorizontal: 5, borderWidth: 1, borderColor: '#333' },
  attachBtn: { padding: 12 },
  textInput: { flex: 1, color: 'white', fontSize: 16, paddingHorizontal: 15, paddingVertical: 12, minHeight: 50, maxHeight: 100, borderWidth: 0, borderColor: 'transparent', outlineStyle: 'none' },
  rightInputIcons: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingRight: 5 },
  sendBtn: { width: 48, height: 48, backgroundColor: '#ccff00', borderRadius: 24, alignItems: 'center', justifyContent: 'center' },

  // Templates
  templateCard: { backgroundColor: '#111', padding: 20, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: '#222' },
  templateIconBox: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  templateTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  templateDesc: { color: '#888', fontSize: 14 },

  // PDF
  uploadZone: { height: 300, borderWidth: 2, borderColor: '#333', borderStyle: 'dashed', borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a' },
  uploadCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#161616', alignItems: 'center', justifyContent: 'center' },
  uploadBtn: { marginTop: 20, backgroundColor: '#3b82f6', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },

  // Image
  imagePlaceholder: { flex: 1, backgroundColor: '#0a0a0a', borderRadius: 20, borderWidth: 1, borderColor: '#222', alignItems: 'center', justifyContent: 'center', minHeight: 400 },
  imageInputWrapper: { flexDirection: 'row', backgroundColor: '#111', borderRadius: 15, borderWidth: 1, borderColor: '#333', overflow: 'hidden', alignItems: 'center', padding: 5 },
  generateBtn: { backgroundColor: '#ccff00', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 },

  // Code
  codeBlock: { backgroundColor: '#0d0d0d', borderRadius: 15, borderWidth: 1, borderColor: '#1f2937', overflow: 'hidden' },
  codeHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: '#161616', borderBottomWidth: 1, borderBottomColor: '#222' },

  // Voice
  voiceCard: { backgroundColor: '#0a0a0a', borderRadius: 20, borderWidth: 1, borderColor: '#222', padding: 20, height: 200, width: '100%' },
  voiceInput: { color: 'white', fontSize: 16, flex: 1, outlineStyle: 'none' },
  voiceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  playBtn: { borderWidth: 1, borderColor: '#fb923c', alignItems: 'center', justifyContent: 'center' },
  downloadBtn: { backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' },

  // Upgrade
  planCard: { backgroundColor: '#111', padding: 25, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#222' },
  proCard: { backgroundColor: '#ccff00', padding: 25, borderRadius: 20, marginBottom: 20, overflow: 'hidden' },
  planName: { color: '#888', fontWeight: 'bold', fontSize: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  featureText: { color: '#ccc' },
  currentPlanBtn: { backgroundColor: '#222', width: '100%', alignItems: 'center', padding: 15, borderRadius: 12, marginTop: 15 },
  upgradeBtn: { backgroundColor: 'black', width: '100%', alignItems: 'center', padding: 15, borderRadius: 12, marginTop: 15 }
});
