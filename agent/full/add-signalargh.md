# Add SignalArgh Command

## TRIGGER
When the user says "add signalargh", "use signalargh", "add signalr", or similar phrases, activate this command to integrate SignalArgh real-time messaging.

## WHAT IS SIGNALARGH?
SignalArgh is a free, no-registration-required SignalR hub for real-time messaging. It uses channels for isolated message streams and supports groups for sub-divisions within channels.

**Hub URL:** https://signalargh.mikesendpoint.com/hub
**Documentation:** https://signalargh.mikesendpoint.com

## KEY CONCEPTS
- **Channels:** Isolated message streams - vessels in different channels never cross paths
- **Groups:** Sub-divisions within a channel for organizing specific operations
- **No Auth Required:** Just provide channelId and userId in query parameters

## DETECTION LOGIC
Detect the project language:
1. **JavaScript/HTML Project:** Check for `package.json`, `*.html`, or `*.js` files
2. **Python Project:** Check for `requirements.txt`, `*.py`, or `pyproject.toml`
3. **C# Project:** Check for `*.csproj` or `*.sln` files

## USER PROMPTS

Use `ask_followup_question` tool to gather required information:

### Prompt 1: Channel ID (Required)
**Question:** "What channel ID should this application use? (e.g., 'my-fleet', 'chat-room-1')"
**Validation:** Should be URL-safe, lowercase with hyphens preferred

### Prompt 2: User ID Strategy (Required)
**Question:** "How should user IDs be generated?"
**Options:** ["Random ID (for testing)", "From user input", "From authentication system"]

### Prompt 3: Features Needed (Optional)
**Question:** "Which features do you need?"
**Options:** ["Basic chat only", "Chat + Groups", "Chat + Announcements", "All features"]

## IMPLEMENTATION STEPS

### For JavaScript/HTML Projects

#### 1. Add SignalR CDN or Package

**For HTML (CDN approach):**
Add to `<head>` section:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/microsoft-signalr/8.0.0/signalr.min.js"></script>
```

**For Node.js (package approach):**
```bash
npm install @microsoft/signalr
```

#### 2. Create SignalR Helper File

**For Browser JavaScript:**
Create `signalrClient.js`:

```javascript
/**
 * SignalArgh Client - Real-time messaging
 * Hub: https://signalargh.mikesendpoint.com/hub
 */

class SignalArghClient {
    constructor(channelId, userId) {
        this.channelId = channelId;
        this.userId = userId;
        this.connection = null;
        this.messageHandlers = new Map();
    }

    async connect() {
        const hubUrl = `https://signalargh.mikesendpoint.com/hub?channelId=${this.channelId}&userId=${this.userId}`;
        
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl)
            .withAutomaticReconnect()
            .build();

        // Setup message handlers
        this.connection.on("channelChat", (data) => {
            const handler = this.messageHandlers.get("channelChat");
            if (handler) handler(data);
        });

        this.connection.on("systemNotification", (message) => {
            const handler = this.messageHandlers.get("systemNotification");
            if (handler) handler(message);
        });

        this.connection.on("channelAnnouncement", (data) => {
            const handler = this.messageHandlers.get("channelAnnouncement");
            if (handler) handler(data);
        });

        this.connection.on("groupChat", (data) => {
            const handler = this.messageHandlers.get("groupChat");
            if (handler) handler(data);
        });

        await this.connection.start();
        console.log("Connected to SignalArgh!");
    }

    on(eventType, handler) {
        this.messageHandlers.set(eventType, handler);
    }

    async sendMessage(message) {
        await this.connection.invoke("SendChannelChat", this.channelId, message);
    }

    async sendAnnouncement(message) {
        await this.connection.invoke("SendChannelAnnouncement", this.channelId, message);
    }

    async joinGroup(groupName) {
        await this.connection.invoke("JoinGroup", groupName);
    }

    async leaveGroup(groupName) {
        await this.connection.invoke("LeaveGroup", groupName);
    }

    async sendToGroup(groupName, message) {
        await this.connection.invoke("PublishToGroupWithUser", groupName, "groupChat", message);
    }

    async disconnect() {
        if (this.connection) {
            await this.connection.stop();
        }
    }
}

// Usage example:
// const client = new SignalArghClient("my-channel", "user-123");
// client.on("channelChat", (data) => console.log(`${data.userId}: ${data.message}`));
// await client.connect();
// await client.sendMessage("Hello!");
```

**For Node.js/ES6:**
Create `signalrClient.js` (or `.mjs`):

```javascript
import * as signalR from "@microsoft/signalr";

export class SignalArghClient {
    constructor(channelId, userId) {
        this.channelId = channelId;
        this.userId = userId;
        this.connection = null;
        this.messageHandlers = new Map();
    }

    async connect() {
        const hubUrl = `https://signalargh.mikesendpoint.com/hub?channelId=${this.channelId}&userId=${this.userId}`;
        
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl)
            .withAutomaticReconnect()
            .build();

        // Setup message handlers
        this.connection.on("channelChat", (data) => {
            const handler = this.messageHandlers.get("channelChat");
            if (handler) handler(data);
        });

        this.connection.on("systemNotification", (message) => {
            const handler = this.messageHandlers.get("systemNotification");
            if (handler) handler(message);
        });

        this.connection.on("channelAnnouncement", (data) => {
            const handler = this.messageHandlers.get("channelAnnouncement");
            if (handler) handler(data);
        });

        this.connection.on("groupChat", (data) => {
            const handler = this.messageHandlers.get("groupChat");
            if (handler) handler(data);
        });

        await this.connection.start();
        console.log("Connected to SignalArgh!");
    }

    on(eventType, handler) {
        this.messageHandlers.set(eventType, handler);
    }

    async sendMessage(message) {
        await this.connection.invoke("SendChannelChat", this.channelId, message);
    }

    async sendAnnouncement(message) {
        await this.connection.invoke("SendChannelAnnouncement", this.channelId, message);
    }

    async joinGroup(groupName) {
        await this.connection.invoke("JoinGroup", groupName);
    }

    async leaveGroup(groupName) {
        await this.connection.invoke("LeaveGroup", groupName);
    }

    async sendToGroup(groupName, message) {
        await this.connection.invoke("PublishToGroupWithUser", groupName, "groupChat", message);
    }

    async disconnect() {
        if (this.connection) {
            await this.connection.stop();
        }
    }
}
```

### For Python Projects

#### 1. Add Package Requirement
Add to `requirements.txt`:
```
signalrcore>=0.9.5
```

Or install directly:
```bash
pip install signalrcore
```

#### 2. Create SignalR Helper File

Create `signalargh_client.py`:

```python
"""
SignalArgh Client - Real-time messaging
Hub: https://signalargh.mikesendpoint.com/hub
"""

from signalrcore.hub_connection_builder import HubConnectionBuilder
from typing import Callable, Dict

class SignalArghClient:
    def __init__(self, channel_id: str, user_id: str):
        self.channel_id = channel_id
        self.user_id = user_id
        self.connection = None
        self.message_handlers: Dict[str, Callable] = {}
        
    def connect(self):
        hub_url = f"https://signalargh.mikesendpoint.com/hub?channelId={self.channel_id}&userId={self.user_id}"
        
        self.connection = HubConnectionBuilder() \
            .with_url(hub_url) \
            .with_automatic_reconnect({
                "type": "interval",
                "intervals": [0, 1000, 2000, 5000]
            }) \
            .build()
        
        # Setup message handlers
        self.connection.on("channelChat", lambda data: 
            self.message_handlers.get("channelChat", lambda x: None)(data))
        
        self.connection.on("systemNotification", lambda message: 
            self.message_handlers.get("systemNotification", lambda x: None)(message))
        
        self.connection.on("channelAnnouncement", lambda data: 
            self.message_handlers.get("channelAnnouncement", lambda x: None)(data))
        
        self.connection.on("groupChat", lambda data: 
            self.message_handlers.get("groupChat", lambda x: None)(data))
        
        self.connection.start()
        print("Connected to SignalArgh!")
    
    def on(self, event_type: str, handler: Callable):
        """Register event handler"""
        self.message_handlers[event_type] = handler
    
    def send_message(self, message: str):
        """Send message to channel"""
        self.connection.send("SendChannelChat", [self.channel_id, message])
    
    def send_announcement(self, message: str):
        """Send announcement to channel"""
        self.connection.send("SendChannelAnnouncement", [self.channel_id, message])
    
    def join_group(self, group_name: str):
        """Join a group within the channel"""
        self.connection.send("JoinGroup", [group_name])
    
    def leave_group(self, group_name: str):
        """Leave a group"""
        self.connection.send("LeaveGroup", [group_name])
    
    def send_to_group(self, group_name: str, message: str):
        """Send message to group"""
        self.connection.send("PublishToGroupWithUser", [group_name, "groupChat", message])
    
    def disconnect(self):
        """Disconnect from hub"""
        if self.connection:
            self.connection.stop()

# Usage example:
# client = SignalArghClient("my-channel", "user-123")
# client.on("channelChat", lambda data: print(f"{data['userId']}: {data['message']}"))
# client.connect()
# client.send_message("Hello from Python!")
```

### For C# Projects

#### 1. Add NuGet Package
Add to `.csproj` or use command:
```bash
dotnet add package Microsoft.AspNetCore.SignalR.Client
```

#### 2. Create SignalR Service

Create `Services/SignalArghService.cs`:

```csharp
using Microsoft.AspNetCore.SignalR.Client;

namespace {{ProjectName}}.Services
{
    /// <summary>
    /// SignalArgh Client - Real-time messaging
    /// Hub: https://signalargh.mikesendpoint.com/hub
    /// </summary>
    public class SignalArghService : IAsyncDisposable
    {
        private readonly string _channelId;
        private readonly string _userId;
        private HubConnection? _connection;
        private readonly Dictionary<string, Action<object>> _handlers = new();

        public SignalArghService(string channelId, string userId)
        {
            _channelId = channelId;
            _userId = userId;
        }

        public async Task ConnectAsync()
        {
            var hubUrl = $"https://signalargh.mikesendpoint.com/hub?channelId={_channelId}&userId={_userId}";

            _connection = new HubConnectionBuilder()
                .WithUrl(hubUrl)
                .WithAutomaticReconnect()
                .Build();

            // Setup message handlers
            _connection.On<dynamic>("channelChat", data =>
            {
                if (_handlers.TryGetValue("channelChat", out var handler))
                    handler(data);
            });

            _connection.On<string>("systemNotification", message =>
            {
                if (_handlers.TryGetValue("systemNotification", out var handler))
                    handler(message);
            });

            _connection.On<dynamic>("channelAnnouncement", data =>
            {
                if (_handlers.TryGetValue("channelAnnouncement", out var handler))
                    handler(data);
            });

            _connection.On<dynamic>("groupChat", data =>
            {
                if (_handlers.TryGetValue("groupChat", out var handler))
                    handler(data);
            });

            await _connection.StartAsync();
            Console.WriteLine("Connected to SignalArgh!");
        }

        public void On(string eventType, Action<object> handler)
        {
            _handlers[eventType] = handler;
        }

        public async Task SendMessageAsync(string message)
        {
            if (_connection == null) throw new InvalidOperationException("Not connected");
            await _connection.InvokeAsync("SendChannelChat", _channelId, message);
        }

        public async Task SendAnnouncementAsync(string message)
        {
            if (_connection == null) throw new InvalidOperationException("Not connected");
            await _connection.InvokeAsync("SendChannelAnnouncement", _channelId, message);
        }

        public async Task JoinGroupAsync(string groupName)
        {
            if (_connection == null) throw new InvalidOperationException("Not connected");
            await _connection.InvokeAsync("JoinGroup", groupName);
        }

        public async Task LeaveGroupAsync(string groupName)
        {
            if (_connection == null) throw new InvalidOperationException("Not connected");
            await _connection.InvokeAsync("LeaveGroup", groupName);
        }

        public async Task SendToGroupAsync(string groupName, string message)
        {
            if (_connection == null) throw new InvalidOperationException("Not connected");
            await _connection.InvokeAsync("PublishToGroupWithUser", groupName, "groupChat", message);
        }

        public async ValueTask DisposeAsync()
        {
            if (_connection != null)
            {
                await _connection.StopAsync();
                await _connection.DisposeAsync();
            }
        }
    }
}
```

## COMPLETION MESSAGE

After successful setup, inform the user:

### For JavaScript Projects
```
SignalArgh client added! ✅

**Configuration:**
- Channel ID: {{channelId}}
- Hub URL: https://signalargh.mikesendpoint.com/hub

**Usage example:**
```javascript
const client = new SignalArghClient("{{channelId}}", "user-123");

// Listen for messages
client.on("channelChat", (data) => {
    console.log(`${data.userId}: ${data.message}`);
});

// Connect
await client.connect();

// Send message
await client.sendMessage("Hello!");
```

**Available methods:**
- `connect()` - Connect to hub
- `sendMessage(text)` - Send chat message
- `sendAnnouncement(text)` - Send priority announcement
- `joinGroup(name)` - Join a group
- `leaveGroup(name)` - Leave a group
- `sendToGroup(group, text)` - Send to specific group
- `disconnect()` - Close connection

**Event types:**
- `channelChat` - Regular messages
- `systemNotification` - System events
- `channelAnnouncement` - Priority announcements
- `groupChat` - Group-specific messages
```

### For Python Projects
```
SignalArgh client added! ✅

**Configuration:**
- Channel ID: {{channelId}}
- Hub URL: https://signalargh.mikesendpoint.com/hub

**Usage example:**
```python
from signalargh_client import SignalArghClient

client = SignalArghClient("{{channelId}}", "user-123")

# Listen for messages
client.on("channelChat", lambda data: print(f"{data['userId']}: {data['message']}"))

# Connect
client.connect()

# Send message
client.send_message("Hello from Python!")
```

**Available methods:**
- `connect()` - Connect to hub
- `send_message(text)` - Send chat message
- `send_announcement(text)` - Send priority announcement
- `join_group(name)` - Join a group
- `leave_group(name)` - Leave a group
- `send_to_group(group, text)` - Send to specific group
- `disconnect()` - Close connection
```

### For C# Projects
```
SignalArgh service added! ✅

**Configuration:**
- Channel ID: {{channelId}}
- Hub URL: https://signalargh.mikesendpoint.com/hub

**Usage example:**
```csharp
var service = new SignalArghService("{{channelId}}", "user-123");

// Listen for messages
service.On("channelChat", data => {
    dynamic msg = data;
    Console.WriteLine($"{msg.userId}: {msg.message}");
});

// Connect
await service.ConnectAsync();

// Send message
await service.SendMessageAsync("Hello from C#!");
```

**Available methods:**
- `ConnectAsync()` - Connect to hub
- `SendMessageAsync(text)` - Send chat message
- `SendAnnouncementAsync(text)` - Send priority announcement
- `JoinGroupAsync(name)` - Join a group
- `LeaveGroupAsync(name)` - Leave a group
- `SendToGroupAsync(group, text)` - Send to specific group
```

## IMPORTANT NOTES

1. **No Authentication:** SignalArgh requires no registration or API keys
2. **Channel Isolation:** Messages in different channels never cross
3. **Connection String:** Always include both `channelId` and `userId` as query parameters
4. **Auto-Reconnect:** Built-in automatic reconnection on connection loss
5. **Health Check:** Test hub availability at https://signalargh.mikesendpoint.com/health
6. **Groups are Optional:** Only use groups if you need sub-divisions within your channel
7. **Testing:** Open https://signalargh.mikesendpoint.com in multiple tabs to test real-time messaging
