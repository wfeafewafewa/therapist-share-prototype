<template>
  <div class="min-h-screen bg-gray-100 font-inter text-gray-800 p-4 sm:p-6 lg:p-8">
    <header class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg mb-8">
      <h1 class="text-3xl sm:text-4xl font-bold text-center">セラピストシェアシステム (プロトタイプ)</h1>
      <p class="text-center mt-2 text-lg">サロンFC本部グループ内セラピストシェア</p>
    </header>

    <main class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <section class="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
        <h2 class="text-2xl font-semibold mb-4 text-blue-700">セラピスト一覧</h2>
        <div class="mb-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            v-model="searchTerm"
            placeholder="セラピストを検索..."
            class="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
          <select
            v-model="selectedSkill"
            class="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          >
            <option value="">全てのスキル</option>
            <option v-for="skill in uniqueSkills" :key="skill" :value="skill">{{ skill }}</option>
          </select>
        </div>

        <div v-if="filteredTherapists.length > 0" class="space-y-4">
          <div
            v-for="therapist in filteredTherapists"
            :key="therapist.id"
            @click="selectTherapist(therapist)"
            class="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200 cursor-pointer hover:bg-blue-100 transition duration-200"
          >
            <h3 class="text-xl font-bold text-blue-800">{{ therapist.name }}</h3>
            <p class="text-sm text-gray-600">所属: {{ therapist.homeSalon }}</p>
            <p class="text-sm text-gray-600">スキル: {{ therapist.skill }}</p>
            <p :class="['text-sm font-semibold', therapist.status === '空きあり' ? 'text-green-600' : 'text-red-600']">
              ステータス: {{ therapist.status }}
            </p>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 p-8">
          <p>セラピストが見つかりません。</p>
        </div>
      </section>

      <section class="lg:col-span-1 bg-white p-6 rounded-xl shadow-md">
        <h2 class="text-2xl font-semibold mb-4 text-blue-700">詳細情報</h2>

        <div v-if="selectedTherapist" class="space-y-6">
          <div class="border-b pb-4 mb-4 border-gray-200">
            <h3 class="text-xl font-bold text-blue-800">{{ selectedTherapist.name }}</h3>
            <p class="text-sm text-gray-600">ID: {{ selectedTherapist.id }}</p>
            <p class="mt-2"><span class="font-semibold">所属サロン:</span> {{ selectedTherapist.homeSalon }}</p>
            <p><span class="font-semibold">スキル:</span> {{ selectedTherapist.skill }}</p>
            <p><span class="font-semibold">時給:</span> ¥{{ selectedTherapist.hourlyRate.toLocaleString() }}</p>
            <p><span class="font-semibold">ステータス:</span> {{ selectedTherapist.status }}</p>
            <p class="mt-2 text-gray-700">{{ selectedTherapist.bio }}</p>
          </div>

          <div class="border-b pb-4 mb-4 border-gray-200">
            <h3 class="text-xl font-semibold mb-3 text-blue-700">稼働時間登録</h3>
            <div class="space-y-2">
              <input type="date" v-model="newTimesheet.date" class="w-full p-2 border rounded-lg" />
              <input type="time" v-model="newTimesheet.startTime" class="w-full p-2 border rounded-lg" />
              <input type="time" v-model="newTimesheet.endTime" class="w-full p-2 border rounded-lg" />
              <button
                @click="addTimesheet"
                class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 shadow-md"
              >
                稼働時間を登録
              </button>
            </div>
          </div>

          <div class="border-b pb-4 mb-4 border-gray-200">
            <h3 class="text-xl font-semibold mb-3 text-blue-700">稼働時間実績</h3>
            <ul v-if="therapistTimesheets.length > 0" class="space-y-2">
              <li v-for="ts in therapistTimesheets" :key="ts.id" class="bg-gray-50 p-2 rounded-md text-sm">
                {{ ts.date }}: {{ ts.startTime }} - {{ ts.endTime }} ({{ ts.salonId }})
              </li>
            </ul>
            <p v-else class="text-gray-500 text-sm">稼働時間の実績はありません。</p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3 text-blue-700">チャット</h3>
            <div class="h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 mb-3 bg-gray-50">
              <div v-for="msg in chatMessages" :key="msg.id" class="mb-2">
                <p :class="['text-sm', msg.senderId === selectedTherapist.id ? 'text-blue-600 font-semibold' : 'text-gray-800']">
                  <span class="font-bold">{{ msg.senderId === selectedTherapist.id ? selectedTherapist.name : 'サロン' }}</span>: {{ msg.content }}
                </p>
                <p class="text-xs text-gray-500 text-right">{{ new Date(msg.timestamp).toLocaleTimeString() }}</p>
              </div>
            </div>
            <textarea
              v-model="newMessageContent"
              placeholder="メッセージを入力..."
              rows="3"
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm mb-3"
            ></textarea>
            <button
              @click="sendMessage"
              class="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 shadow-md"
            >
              メッセージを送信
            </button>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 p-8">
          <p>左側のリストからセラピストを選択してください。</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'; // VueのリアクティブAPIとライフサイクルフックをインポート

export default {
  setup() {
    // リアクティブな状態変数
    const therapists = ref([]); // 全セラピストのリスト
    const selectedTherapist = ref(null); // 現在選択されているセラピスト
    const searchTerm = ref(''); // 検索キーワード
    const selectedSkill = ref(''); // 選択されたスキルでフィルタリング
    const therapistTimesheets = ref([]); // 選択されたセラピストの稼働時間
    const chatMessages = ref([]); // チャットメッセージ
    const newMessageContent = ref(''); // 新しいチャットメッセージの内容

    // 新しい稼働時間登録用のデータ
    const newTimesheet = ref({
      date: '',
      startTime: '',
      endTime: '',
    });

    // バックエンドAPIのベースURL
    const API_BASE_URL = 'http://localhost:3000/api';

    // 全セラピストを取得する関数
    const fetchTherapists = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/therapists`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        therapists.value = await response.json();
      } catch (error) {
        console.error('セラピストの取得に失敗しました:', error);
      }
    };

    // 選択されたセラピストの稼働時間を取得する関数
    const fetchTherapistTimesheets = async (therapistId) => {
      try {
        const response = await fetch(`${API_BASE_URL}/therapists/${therapistId}/timesheets`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        therapistTimesheets.value = await response.json();
      } catch (error) {
        console.error('稼働時間の取得に失敗しました:', error);
        therapistTimesheets.value = []; // エラー時は空にする
      }
    };

    // 全チャットメッセージを取得する関数（プロトタイプ用）
    const fetchChatMessages = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/messages`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        chatMessages.value = await response.json();
      } catch (error) {
        console.error('チャットメッセージの取得に失敗しました:', error);
      }
    };

    // コンポーネントがマウントされたときにセラピストとチャットメッセージをフェッチ
    onMounted(() => {
      fetchTherapists();
      fetchChatMessages();
    });

    // フィルタリングされたセラピストのリストを計算する算出プロパティ
    const filteredTherapists = computed(() => {
      return therapists.value.filter(therapist => {
        const matchesSearch = therapist.name.toLowerCase().includes(searchTerm.value.toLowerCase());
        const matchesSkill = selectedSkill.value === '' || therapist.skill.includes(selectedSkill.value);
        return matchesSearch && matchesSkill;
      });
    });

    // ユニークなスキルリストを計算する算出プロパティ
    const uniqueSkills = computed(() => {
      const skills = new Set();
      therapists.value.forEach(t => skills.add(t.skill));
      return Array.from(skills);
    });

    // セラピストを選択する関数
    const selectTherapist = (therapist) => {
      selectedTherapist.value = therapist;
      fetchTherapistTimesheets(therapist.id); // 選択されたセラピストの稼働時間をフェッチ
    };

    // 稼働時間を追加する関数
    const addTimesheet = async () => {
      if (!selectedTherapist.value || !newTimesheet.value.date || !newTimesheet.value.startTime || !newTimesheet.value.endTime) {
        alert('稼働時間を登録するには、日付と開始・終了時間が必要です。'); // alertの代わりにカスタムモーダルを使用することを推奨
        return;
      }

      const payload = {
        therapistId: selectedTherapist.value.id,
        salonId: 'S001', // プロトタイプでは固定のサロンIDを使用
        date: newTimesheet.value.date,
        startTime: newTimesheet.value.startTime,
        endTime: newTimesheet.value.endTime,
      };

      try {
        const response = await fetch(`${API_BASE_URL}/timesheets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const addedTimesheet = await response.json();
        therapistTimesheets.value.push(addedTimesheet); // UIを更新
        // フォームをリセット
        newTimesheet.value.date = '';
        newTimesheet.value.startTime = '';
        newTimesheet.value.endTime = '';
        alert('稼働時間が登録されました！'); // alertの代わりにカスタムモーダルを使用することを推奨
      } catch (error) {
        console.error('稼働時間の登録に失敗しました:', error);
        alert('稼働時間の登録に失敗しました。'); // alertの代わりにカスタムモーダルを使用することを推奨
      }
    };

    // メッセージを送信する関数
    const sendMessage = async () => {
      if (!selectedTherapist.value || !newMessageContent.value.trim()) {
        alert('メッセージを入力してください。'); // alertの代わりにカスタムモーダルを使用することを推奨
        return;
      }

      const payload = {
        senderId: 'S001', // プロトタイプでは固定のサロンIDを送信者とする
        receiverId: selectedTherapist.value.id,
        content: newMessageContent.value.trim(),
      };

      try {
        const response = await fetch(`${API_BASE_URL}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const sentMessage = await response.json();
        chatMessages.value.push(sentMessage); // UIを更新
        newMessageContent.value = ''; // 入力フィールドをクリア
        // メッセージリストを一番下までスクロールするロジックをここに追加
      } catch (error) {
        console.error('メッセージの送信に失敗しました:', error);
        alert('メッセージの送信に失敗しました。'); // alertの代わりにカスタムモーダルを使用することを推奨
      }
    };

    // テンプレートで利用可能にするデータと関数を返す
    return {
      therapists,
      selectedTherapist,
      searchTerm,
      selectedSkill,
      filteredTherapists,
      uniqueSkills,
      selectTherapist,
      newTimesheet,
      addTimesheet,
      therapistTimesheets,
      chatMessages,
      newMessageContent,
      sendMessage,
    };
  },
};
</script>

<style>
/* Google Fonts - Inter をインポート (必要に応じて) */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* カスタムスタイルがあればここに追加 */
body {
  font-family: 'Inter', sans-serif;
}
</style>