import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface Memo {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

type Screen = 'login' | 'signup' | 'memoList' | 'memoDetail' | 'memoEdit' | 'memoCreate';

const STORAGE_KEY = '@memo_app_memos';
const AUTH_KEY = '@memo_app_auth';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [memos, setMemos] = useState<Memo[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');

  // 認証状態を確認
  useEffect(() => {
    checkAuth();
  }, []);

  // メモを読み込む
  useEffect(() => {
    if (screen === 'memoList') {
      loadMemos();
    }
  }, [screen]);

  const checkAuth = async () => {
    try {
      const auth = await AsyncStorage.getItem(AUTH_KEY);
      if (auth) {
        setScreen('memoList');
      }
    } catch (error) {
      console.error('認証確認エラー:', error);
    }
  };

  const loadMemos = async () => {
    try {
      const storedMemos = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedMemos) {
        setMemos(JSON.parse(storedMemos));
      }
    } catch (error) {
      console.error('メモの読み込みエラー:', error);
    }
  };

  const saveMemos = async (newMemos: Memo[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newMemos));
      setMemos(newMemos);
    } catch (error) {
      console.error('メモの保存エラー:', error);
      Alert.alert('エラー', 'メモの保存に失敗しました');
    }
  };

  // ログイン処理
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }
    // 簡易認証（実際のアプリではサーバーと通信）
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ email }));
    setScreen('memoList');
    setEmail('');
    setPassword('');
  };

  // サインアップ処理
  const handleSignup = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }
    // 簡易認証（実際のアプリではサーバーと通信）
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ email }));
    setScreen('memoList');
    setEmail('');
    setPassword('');
  };

  // ログアウト処理
  const handleLogout = async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    setScreen('login');
    setMemos([]);
  };

  // メモを開く
  const openMemo = (memo: Memo) => {
    setSelectedMemo(memo);
    setScreen('memoDetail');
  };

  // メモを削除
  const deleteMemo = (id: string) => {
    Alert.alert(
      '削除確認',
      'このメモを削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            const updatedMemos = memos.filter((memo) => memo.id !== id);
            saveMemos(updatedMemos);
          },
        },
      ]
    );
  };

  // メモ作成画面を開く
  const openCreateMemo = () => {
    setEditTitle('');
    setEditBody('');
    setSelectedMemo(null);
    setScreen('memoCreate');
  };

  // メモ編集画面を開く
  const openEditMemo = () => {
    if (selectedMemo) {
      setEditTitle(selectedMemo.title);
      setEditBody(selectedMemo.body);
      setScreen('memoEdit');
    }
  };

  // メモを保存
  const saveMemo = () => {
    if (!editTitle.trim()) {
      Alert.alert('エラー', 'タイトルを入力してください');
      return;
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (selectedMemo) {
      // 既存メモを更新
      const updatedMemos = memos.map((memo) =>
        memo.id === selectedMemo.id
          ? { ...memo, title: editTitle.trim(), body: editBody.trim(), createdAt: dateStr }
          : memo
      );
      saveMemos(updatedMemos);
      setSelectedMemo({ ...selectedMemo, title: editTitle.trim(), body: editBody.trim(), createdAt: dateStr });
      setScreen('memoDetail');
    } else {
      // 新規メモを作成
      const newMemo: Memo = {
        id: Date.now().toString(),
        title: editTitle.trim(),
        body: editBody.trim(),
        createdAt: dateStr,
      };
      const updatedMemos = [newMemo, ...memos];
      saveMemos(updatedMemos);
      setSelectedMemo(newMemo);
      setScreen('memoDetail');
    }
  };

  // 日付フォーマット
  const formatDate = (dateStr: string) => {
    return dateStr;
  };

  // ログイン画面
  const renderLogin = () => (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Memo App</Text>
      </View>
      <View style={styles.authContainer}>
        <Text style={styles.authTitle}>Log In</Text>
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleLogin}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
        <View style={styles.authLinkContainer}>
          <Text style={styles.authLinkText}>Not registered? </Text>
          <TouchableOpacity onPress={() => setScreen('signup')}>
            <Text style={styles.authLink}>Sign up here!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // サインアップ画面
  const renderSignup = () => (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Memo App</Text>
      </View>
      <View style={styles.authContainer}>
        <Text style={styles.authTitle}>Sign Up</Text>
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleSignup}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
        <View style={styles.authLinkContainer}>
          <Text style={styles.authLinkText}>Already registered? </Text>
          <TouchableOpacity onPress={() => setScreen('login')}>
            <Text style={styles.authLink}>Log In.</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // メモ一覧画面
  const renderMemoList = () => (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Memo App</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>ログアウト</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={memos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.memoRow}
            onPress={() => openMemo(item)}
            activeOpacity={0.7}
          >
            <View style={styles.memoRowContent}>
              <Text style={styles.memoRowTitle}>{item.title}</Text>
              <Text style={styles.memoRowDate}>{formatDate(item.createdAt)}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteIconButton}
              onPress={() => deleteMemo(item.id)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity style={styles.fab} onPress={openCreateMemo}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  // メモ詳細画面
  const renderMemoDetail = () => {
    if (!selectedMemo) return null;
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setScreen('memoList')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Memo App</Text>
          <View style={styles.headerSpacer} />
        </View>
        <ScrollView style={styles.detailContainer} contentContainerStyle={styles.detailContent}>
          <Text style={styles.detailTitle}>{selectedMemo.title}</Text>
          <Text style={styles.detailDate}>{formatDate(selectedMemo.createdAt)}</Text>
          <Text style={styles.detailBody}>{selectedMemo.body}</Text>
        </ScrollView>
        <TouchableOpacity style={styles.fab} onPress={openEditMemo}>
          <Ionicons name="pencil" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  // メモ編集画面
  const renderMemoEdit = () => (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setScreen(selectedMemo ? 'memoDetail' : 'memoList')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Memo App</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView style={styles.editContainer} contentContainerStyle={styles.editContent}>
        <TextInput
          style={styles.editTitleInput}
          placeholder="タイトル"
          value={editTitle}
          onChangeText={setEditTitle}
          multiline
        />
        <TextInput
          style={styles.editBodyInput}
          placeholder="本文"
          value={editBody}
          onChangeText={setEditBody}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>
      <TouchableOpacity style={styles.fab} onPress={saveMemo}>
        <Ionicons name="checkmark" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  // メモ作成画面
  const renderMemoCreate = () => (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setScreen('memoList')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Memo App</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView style={styles.editContainer} contentContainerStyle={styles.editContent}>
        <TextInput
          style={styles.editTitleInput}
          placeholder="タイトル"
          value={editTitle}
          onChangeText={setEditTitle}
          multiline
        />
        <TextInput
          style={styles.editBodyInput}
          placeholder="本文"
          value={editBody}
          onChangeText={setEditBody}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>
      <TouchableOpacity style={styles.fab} onPress={saveMemo}>
        <Ionicons name="checkmark" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  // 画面に応じてレンダリング
  switch (screen) {
    case 'login':
      return renderLogin();
    case 'signup':
      return renderSignup();
    case 'memoList':
      return renderMemoList();
    case 'memoDetail':
      return renderMemoDetail();
    case 'memoEdit':
      return renderMemoEdit();
    case 'memoCreate':
      return renderMemoCreate();
    default:
      return renderLogin();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 80,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 4,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  authContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#000',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  authLinkContainer: {
    flexDirection: 'row',
    marginTop: 16,
    alignItems: 'center',
  },
  authLinkText: {
    fontSize: 14,
    color: '#666',
  },
  authLink: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  memoRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memoRowContent: {
    flex: 1,
  },
  memoRowTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  memoRowDate: {
    fontSize: 12,
    color: '#666',
  },
  deleteIconButton: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#2196F3',
  },
  detailContent: {
    padding: 16,
    paddingTop: 0,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    marginTop: 16,
  },
  detailDate: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 16,
  },
  detailBody: {
    fontSize: 16,
    color: '#000',
    lineHeight: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 4,
  },
  editContainer: {
    flex: 1,
    backgroundColor: '#2196F3',
  },
  editContent: {
    padding: 16,
    paddingTop: 0,
  },
  editTitleInput: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    marginTop: 16,
    minHeight: 40,
  },
  editBodyInput: {
    fontSize: 16,
    color: '#000',
    lineHeight: 24,
    minHeight: 400,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 4,
  },
});
