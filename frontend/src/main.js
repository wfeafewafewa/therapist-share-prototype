// src/main.js
import { createApp } from 'vue'; // Vueアプリケーションを作成するための関数をインポート
import './main.css'; // グローバルスタイルシートをインポート (Tailwind CSSのベーススタイル用)
import App from './App.vue'; // ルートコンポーネントをインポート

createApp(App).mount('#app'); // Vueアプリケーションを作成し、HTMLのIDが'app'の要素にマウント