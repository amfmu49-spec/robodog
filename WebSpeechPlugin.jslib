mergeInto(LibraryManager.library, {
    // ブラウザのWeb Speech API(TTS)で音声読み上げを行うJSプラグイン
    PlayWebSpeechTTS: function (textPtr) {
        var text = UTF8ToString(textPtr);
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            var utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            utterance.pitch = 1.3;
            utterance.rate = 1.1;
            window.speechSynthesis.speak(utterance);
        }
    }
});
