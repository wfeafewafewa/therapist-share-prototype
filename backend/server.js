// server.js
const express = require('express'); // Express.js フレームワークをインポート
const cors = require('cors'); // CORSミドルウェアをインポートし、異なるオリジンからのリクエストを許可

const app = express(); // Expressアプリケーションのインスタンスを作成
const port = 3000; // サーバーがリッスンするポート番号

app.use(cors()); // すべてのオリジンからのCORSリクエストを許可
app.use(express.json()); // リクエストボディのJSONをパースするためのミドルウェア

// モックデータ：セラピスト情報
let therapists = [
    {
        id: 'T001',
        name: '田中 太郎',
        skill: 'アロママッサージ',
        status: '空きあり',
        hourlyRate: 3000,
        homeSalon: '銀座店',
        contact: 'taro.t@example.com',
        bio: '経験豊富なアロマセラピストです。お客様の心身のリラックスをサポートします。',
        applicationHistory: ['2024-01-15: 新宿店', '2024-02-20: 渋谷店'],
        workHours: [
            { date: '2024-05-20', hours: 8, salon: '新宿店' },
            { date: '2024-05-21', hours: 7.5, salon: '新宿店' },
        ],
        reviews: []
    },
    {
        id: 'T002',
        name: '佐藤 花子',
        skill: '整体、リフレクソロジー',
        status: '稼働中',
        hourlyRate: 3200,
        homeSalon: '渋谷店',
        contact: 'hanako.s@example.com',
        bio: 'お客様の体の悩みに寄り添い、最適な施術を提供します。',
        applicationHistory: ['2024-03-01: 池袋店'],
        workHours: [
            { date: '2024-05-22', hours: 6, salon: '池袋店' },
        ],
        reviews: []
    },
    {
        id: 'T003',
        name: '鈴木 健太',
        skill: 'ヘッドスパ、フェイシャル',
        status: '空きあり',
        hourlyRate: 2800,
        homeSalon: '横浜店',
        contact: 'kenta.s@example.com',
        bio: '癒しのヘッドスパと、お肌の悩みに合わせたフェイシャルが得意です。',
        applicationHistory: [],
        workHours: [],
        reviews: []
    },
];

// モックデータ：稼働時間情報（簡易版）
let timesheets = [
    { id: 'TS001', therapistId: 'T001', salonId: 'S001', date: '2024-05-20', startTime: '10:00', endTime: '18:00', confirmed: true },
    { id: 'TS002', therapistId: 'T001', salonId: 'S001', date: '2024-05-21', startTime: '11:00', endTime: '18:30', confirmed: true },
    { id: 'TS003', therapistId: 'T002', salonId: 'S002', date: '2024-05-22', startTime: '09:00', endTime: '15:00', confirmed: true },
];

// モックデータ：チャットメッセージ
let messages = [
    { id: 'M001', senderId: 'T001', receiverId: 'S001', content: '明日のシフトについて確認させてください。', timestamp: '2024-05-23T10:00:00Z' },
    { id: 'M002', senderId: 'S001', receiverId: 'T001', content: 'はい、何でしょうか？', timestamp: '2024-05-23T10:05:00Z' },
];

// APIエンドポイント：すべてのセラピストを取得
app.get('/api/therapists', (req, res) => {
    res.json(therapists); // セラピストのリストをJSON形式で返す
});

// APIエンドポイント：特定のセラピストをIDで取得
app.get('/api/therapists/:id', (req, res) => {
    const therapist = therapists.find(t => t.id === req.params.id); // URLパラメータからIDを取得し、セラピストを検索
    if (therapist) {
        res.json(therapist); // 見つかったセラピストを返す
    } else {
        res.status(404).send('セラピストが見つかりません'); // 見つからなければ404エラーを返す
    }
});

// APIエンドポイント：セラピストの稼働時間を追加/更新
app.post('/api/timesheets', (req, res) => {
    const { therapistId, salonId, date, startTime, endTime } = req.body;
    if (!therapistId || !salonId || !date || !startTime || !endTime) {
        return res.status(400).send('必要な情報が不足しています。');
    }
    const newTimesheet = {
        id: `TS${timesheets.length + 1}`, // 簡易的なID生成
        therapistId,
        salonId,
        date,
        startTime,
        endTime,
        confirmed: true // プロトタイプでは常に確定済みとする
    };
    timesheets.push(newTimesheet);
    res.status(201).json(newTimesheet); // 新しい稼働時間を返す
});

// APIエンドポイント：特定のセラピストの稼働時間を取得
app.get('/api/therapists/:id/timesheets', (req, res) => {
    const therapistTimesheets = timesheets.filter(ts => ts.therapistId === req.params.id);
    res.json(therapistTimesheets);
});

// APIエンドポイント：チャットメッセージの取得（簡易版）
app.get('/api/messages', (req, res) => {
    // 実際にはsenderIdとreceiverIdに基づいてフィルタリングするが、プロトタイプでは全件返す
    res.json(messages);
});

// APIエンドポイント：チャットメッセージの送信（簡易版）
app.post('/api/messages', (req, res) => {
    const { senderId, receiverId, content } = req.body;
    if (!senderId || !receiverId || !content) {
        return res.status(400).send('メッセージの送信に必要な情報が不足しています。');
    }
    const newMessage = {
        id: `M${messages.length + 1}`,
        senderId,
        receiverId,
        content,
        timestamp: new Date().toISOString()
    };
    messages.push(newMessage);
    res.status(201).json(newMessage);
});


// サーバーを起動し、指定されたポートでリッスン
app.listen(port, () => {
    console.log(`セラピストシェアバックエンドが http://localhost:${port} で起動しました`);
});
