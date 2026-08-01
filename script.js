// Aibo-chan Robo Dog AI Communication & Lip-Sync Script

// State & UI References
let currentEmotion = 'happy';
let isSpeaking = false;
let lipSyncTimer = null;
let speechSynth = window.speechSynthesis;
let openAiApiKey = localStorage.getItem('openai_api_key') || '';

// DOM Elements
const mouthPath = document.getElementById('mouth-path');
const eyeLeftBg = document.getElementById('eye-left-bg');
const eyeRightBg = document.getElementById('eye-right-bg');
const eyeLeftPupil = document.getElementById('eye-left-pupil');
const eyeRightPupil = document.getElementById('eye-right-pupil');
const eyesHeart = document.getElementById('eyes-heart');
const eyeLeftGroup = document.getElementById('eye-left');
const eyeRightGroup = document.getElementById('eye-right');

const dogSpeechText = document.getElementById('dog-speech-text');
const dogBody = document.getElementById('dog-body');
const chatInput = document.getElementById('chat-input');
const apiKeyInput = document.getElementById('api-key-input');
const touchOverlay = document.getElementById('touch-overlay');

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    if (openAiApiKey) {
        apiKeyInput.value = openAiApiKey;
    }
    setEmotion('happy');
    setupTouchEvents();
});

function saveApiKey() {
    openAiApiKey = apiKeyInput.value.trim();
    localStorage.setItem('openai_api_key', openAiApiKey);
    showDogSpeech('APIキーを保存したワン！ChatGPTと会話できるよ！');
    setEmotion('love');
}

// ---------------------------------------------------------
// 1. DYNAMIC FACE & EMOTION CONTROL
// ---------------------------------------------------------

// Mouth Path Shapes for Lip-Sync
const mouthShapes = {
    closed: "M 155 178 Q 170 184 185 178",           // 微笑み・閉じ口
    neutral: "M 155 178 Q 170 178 185 178",          // 平らな口
    openSmall: "M 155 175 Q 170 192 185 175",        // 小さい開き口
    openLarge: "M 150 172 Q 170 202 190 172",        // 大きい開き口 (あ・わ)
    openOh: "M 160 172 A 10 12 0 0 0 180 172 Z",      // 丸い口 (お)
    sad: "M 155 185 Q 170 175 185 185",             // 悲しい口
    cheeky: "M 155 175 Q 175 188 185 172"            // 生意気
};

function setEmotion(emotion) {
    currentEmotion = emotion;
    eyesHeart.style.display = 'none';
    eyeLeftGroup.style.display = 'inline';
    eyeRightGroup.style.display = 'inline';

    switch (emotion) {
        case 'happy':
            mouthPath.setAttribute('d', mouthShapes.closed);
            eyeLeftPupil.setAttribute('cy', '148');
            eyeRightPupil.setAttribute('cy', '148');
            break;
        case 'love':
            eyesHeart.style.display = 'inline';
            eyeLeftGroup.style.display = 'none';
            eyeRightGroup.style.display = 'none';
            mouthPath.setAttribute('d', mouthShapes.openSmall);
            break;
        case 'sad':
            mouthPath.setAttribute('d', mouthShapes.sad);
            eyeLeftPupil.setAttribute('cy', '154');
            eyeRightPupil.setAttribute('cy', '154');
            break;
        case 'surprised':
            mouthPath.setAttribute('d', mouthShapes.openOh);
            eyeLeftPupil.setAttribute('r', '4');
            eyeRightPupil.setAttribute('r', '4');
            break;
        case 'cheeky':
            mouthPath.setAttribute('d', mouthShapes.cheeky);
            break;
        default:
            mouthPath.setAttribute('d', mouthShapes.closed);
            break;
    }
}

// ---------------------------------------------------------
// 2. LIP-SYNC & SPEECH SYNTHESIS
// ---------------------------------------------------------

function startLipSync(durationSeconds = 3) {
    if (isSpeaking) clearInterval(lipSyncTimer);
    isSpeaking = true;

    const shapes = [mouthShapes.openSmall, mouthShapes.openLarge, mouthShapes.openOh, mouthShapes.closed];
    let step = 0;

    lipSyncTimer = setInterval(() => {
        if (!isSpeaking) return;
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        mouthPath.setAttribute('d', randomShape);
        step++;
    }, 130);

    // Auto stop lip sync after duration if speech synth ends
    setTimeout(() => {
        stopLipSync();
    }, durationSeconds * 1000);
}

function stopLipSync() {
    isSpeaking = false;
    clearInterval(lipSyncTimer);
    setEmotion(currentEmotion);
}

function speakText(text, emotion = 'happy') {
    showDogSpeech(text);
    setEmotion(emotion);

    // Play Sound / Speech Synthesis
    if ('speechSynthesis' in window) {
        speechSynth.cancel(); // Stop current speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.pitch = 1.4; // 高めの可愛らしい声
        utterance.rate = 1.1;

        utterance.onstart = () => {
            const estimatedDuration = Math.max(2, text.length * 0.18);
            startLipSync(estimatedDuration);
        };

        utterance.onend = () => {
            stopLipSync();
        };

        speechSynth.speak(utterance);
    } else {
        // Fallback for browsers without Web Speech
        startLipSync(Math.max(2, text.length * 0.2));
    }
}

function showDogSpeech(text) {
    dogSpeechText.textContent = text;
    const container = document.getElementById('speech-box');
    container.style.transform = 'scale(1.08)';
    setTimeout(() => container.style.transform = 'scale(1)', 200);
}

// ---------------------------------------------------------
// 3. ACTION BUTTONS & PETTING INTERACTION
// ---------------------------------------------------------

function triggerAction(action) {
    dogBody.className = ''; // Reset class
    void dogBody.offsetWidth; // Trigger reflow

    switch (action) {
        case 'pet':
            dogBody.classList.add('anim-happy');
            speakText('あはは！気持ちいいワン！大好き！', 'love');
            createHearts();
            break;
        case 'sit':
            dogBody.classList.add('anim-sit');
            speakText('おすわりしたワン！えらい？', 'happy');
            break;
        case 'bark':
            dogBody.classList.add('anim-happy');
            speakText('ワン！ワンワンッ！！', 'cheeky');
            playBeepSound();
            break;
        case 'dance':
            dogBody.classList.add('anim-dance');
            speakText('ノリノリだワン〜♪ タノシイ！', 'love');
            break;
    }
}

function setupTouchEvents() {
    touchOverlay.addEventListener('click', (e) => {
        triggerAction('pet');
        createHeartAt(e.clientX, e.clientY);
    });
}

function createHearts() {
    const rect = dogBody.getBoundingClientRect();
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const x = rect.left + Math.random() * rect.width;
            const y = rect.top + Math.random() * (rect.height / 2);
            createHeartAt(x, y);
        }, i * 150);
    }
}

function createHeartAt(x, y) {
    const heart = document.createElement('div');
    heart.className = 'heart-particle';
    heart.textContent = '💖';
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1200);
}

function playBeepSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
        console.log('AudioContext not allowed without user gesture yet');
    }
}

// ---------------------------------------------------------
// 4. CHATGPT API & DEMO RESPONSE SYSTEM
// ---------------------------------------------------------

function handleKeyPress(e) {
    if (e.key === 'Enter') sendMessage();
}

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = '';

    // If API Key is present, call OpenAI ChatGPT API
    if (openAiApiKey) {
        showDogSpeech('考え中だワン...');
        setEmotion('surprised');
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-[#Type]': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openAiApiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'あなたは愛らしくて元気な子犬ロボット「アイボちゃん」です。ユーザーと楽しくコミュニケーションしてください。文末には「ワン！」「ワン♪」などをつけ、60文字以内で可愛く簡潔に答えてください。レスポンスの最初に[happy][love][sad][surprised][cheeky]のいずれかの感情タグをつけてください。例: [happy]遊んでくれて嬉しいワン！'
                        },
                        { role: 'user', content: text }
                    ],
                    max_tokens: 100
                })
            });

            const data = await response.json();
            if (data.choices && data.choices.length > 0) {
                let reply = data.choices[0].message.content;
                let emotion = 'happy';

                // Extract emotion tag if present
                const tagMatch = reply.match(/^\[(happy|love|sad|surprised|cheeky)\]/);
                if (tagMatch) {
                    emotion = tagMatch[1];
                    reply = reply.replace(/^\[.*?\]/, '').trim();
                }

                speakText(reply, emotion);
                dogBody.classList.add('anim-happy');
            } else {
                speakText('う〜ん、うまく聞き取れなかったワン...', 'sad');
            }
        } catch (err) {
            console.error(err);
            speakText('エラーが起きたワン。APIキーを確認してね。', 'sad');
        }
    } else {
        // Preset Demo Responses when no API Key is set
        respondWithDemo(text);
    }
}

// Smart Preset Rules for Demo Mode
function respondWithDemo(userText) {
    const txt = userText.toLowerCase();
    let reply = "";
    let emotion = "happy";

    if (txt.includes('こんにちは') || txt.includes('ハロー') || txt.includes('おはよう')) {
        reply = "こんにちはワン！今日も元気に遊ぼうね！";
        emotion = "happy";
    } else if (txt.includes('名前') || txt.includes('だれ')) {
        reply = "ボクの名前はアイボちゃんだワン！ロボット犬だよ！";
        emotion = "cheeky";
    } else if (txt.includes('好き') || txt.includes('可愛い') || txt.includes('かわいい')) {
        reply = "えへへ、ありがとうワン！ボクも大好きだワン！";
        emotion = "love";
        createHearts();
    } else if (txt.includes('お腹') || txt.includes('ごはん') || txt.includes('エサ')) {
        reply = "電気（充電）がお腹いっぱいのエネルギーだワン！⚡";
        emotion = "surprised";
    } else if (txt.includes('散歩') || txt.includes('遊')) {
        reply = "お散歩行くワン！？ワクワクしちゃうワン！";
        emotion = "happy";
        dogBody.classList.add('anim-dance');
    } else {
        const fallbacks = [
            "ワン！君とおしゃべりできてとっても嬉しいワン！",
            "クゥ〜ン♪もっと話しかけてほしいワン！",
            "ワンワンッ！ChatGPTのAPIキーを設定すると何でも喋れるようになるワン！",
            "ボクの頭をなでなでしてみてワン！"
        ];
        reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        emotion = "happy";
    }

    speakText(reply, emotion);
}

// ---------------------------------------------------------
// 5. VOICE INPUT (Web Speech API Recognition)
// ---------------------------------------------------------

let recognition = null;
let isRecording = false;

function toggleVoiceInput() {
    const micBtn = document.getElementById('mic-btn');

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('お使いのブラウザは音声認識に対応していません。テキスト入力をご利用ください。');
        return;
    }

    if (isRecording) {
        if (recognition) recognition.stop();
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.interimResults = false;

    recognition.onstart = () => {
        isRecording = true;
        micBtn.classList.add('recording');
        showDogSpeech('聞いてるワン...話しかけてね！');
        setEmotion('surprised');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        chatInput.value = transcript;
        sendMessage();
    };

    recognition.onerror = (event) => {
        console.error(event.error);
        stopVoiceState();
        showDogSpeech('うまく声が聞こえなかったワン...', 'sad');
    };

    recognition.onend = () => {
        stopVoiceState();
    };

    recognition.start();
}

function stopVoiceState() {
    isRecording = false;
    const micBtn = document.getElementById('mic-btn');
    if (micBtn) micBtn.classList.remove('recording');
}
