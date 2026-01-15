import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, set, update, onValue } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyCjyL4W7ZdpjUqbDyk-h6hF8iKi5kAeDMI",
    authDomain: "typeabc-f91aa.firebaseapp.com",
    databaseURL: "https://typeabc-f91aa-default-rtdb.firebaseio.com",
    projectId: "typeabc-f91aa",
    storageBucket: "typeabc-f91aa.appspot.com",
    messagingSenderId: "631452791937",
    appId: "1:631452791937:web:e9666f084661dd99054980",
    measurementId: "G-K6Z0ZFLB3E"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function testMessageSending() {
    console.log("Testing message sending to Firebase...");

    const senderId = "166aa856-3243-4b38-a024-07ca5fe9b83d"; // tenant@househaunters.com
    const receiverId = "7cf518e6-0509-441e-a72d-c86cfc6fca1a"; // hunter_1768425476994@test.com

    try {
        // 1. Create conversation ID
        const conversationId = [senderId, receiverId].sort().join("_");
        console.log("Conversation ID:", conversationId);

        // 2. Create message
        const messagesRef = ref(db, `messages/${conversationId}`);
        const newMessageRef = push(messagesRef);

        const message = {
            id: newMessageRef.key,
            senderId: senderId,
            receiverId: receiverId,
            content: "Test message from script",
            type: "TEXT",
            isRead: false,
            createdAt: new Date().toISOString(),
            sender: {
                id: senderId,
                name: "Test Tenant",
                avatarUrl: null
            }
        };

        console.log("Attempting to write message:", message);
        await set(newMessageRef, message);
        console.log("✓ Message written successfully!");

        // 3. Update conversations
        const updates = {};
        updates[`user-conversations/${senderId}/${receiverId}/lastMessage`] = message;
        updates[`user-conversations/${senderId}/${receiverId}/partner`] = {
            id: receiverId,
            name: "Test Hunter",
            role: "HUNTER"
        };

        updates[`user-conversations/${receiverId}/${senderId}/lastMessage`] = message;
        updates[`user-conversations/${receiverId}/${senderId}/partner`] = {
            id: senderId,
            name: "Test Tenant",
            role: "TENANT"
        };
        updates[`user-conversations/${receiverId}/${senderId}/unreadCount`] = 1;

        console.log("Updating conversations...");
        await update(ref(db), updates);
        console.log("✓ Conversations updated successfully!");

        // 4. Verify by reading back
        console.log("\nVerifying message was saved...");
        const snapshot = await new Promise((resolve) => {
            const messagesRef = ref(db, `messages/${conversationId}`);
            onValue(messagesRef, (snapshot) => {
                resolve(snapshot);
            }, { onlyOnce: true });
        });

        const messages = snapshot.val();
        console.log("Messages in database:", JSON.stringify(messages, null, 2));

        console.log("\n✓✓✓ All tests passed! Message sending works correctly.");
        process.exit(0);

    } catch (error) {
        console.error("✗ Test failed:", error);
        console.error("Error details:", error.message);
        if (error.code) {
            console.error("Error code:", error.code);
        }
        process.exit(1);
    }
}

testMessageSending();
