// HTML snippets from which we construct the chat.
var chat_window_html = '' +
'<div class="conv-wrapper">' +
    '<div class="conv-header" id="conv-header">Chat</div>' +
    '<div class="conv-chat" id="conv-chat"></div>' +
    '<div class="conv-input-wrapper" id="conv-input-wrapper">' +
        '<form class="conv-input" id="conv-input">' +
            '<input type="text"   name="conv-message" class="conv-msg"      id="conv-msg" placeholder="Type a message"/>' +
        '</form>' +
    '</div>' +
'</div>';

var chat_message = {
    'conv-msg-user': '<div class="conv-msg-wrapper conv-msg-user"><div class="conv-msg-content conv-msg-user-content"></div></div>',
    'conv-msg-bot':  '<div class="conv-msg-wrapper conv-msg-bot"> <div class="conv-msg-content conv-msg-bot-content"> </div></div>'
}

var state = {
    'shown': true,
    'context': {},
    'at_least_one_request_ok': false
};

//var proxy_url = '/watson-conversation-web/proxy.php';
//var proxy_url = '/proxy.php';
var proxy_url = 'xxxxx';

function read_user_input() {
    var user_input_element = document.getElementById('conv-msg');
    var user_input = user_input_element.value;
    user_input_element.value = '';
    user_input_element.focus();

    return user_input;
}

function append_message(message, class_name) {
    var new_node = document.createElement('div');
    new_node.insertAdjacentHTML('afterbegin', chat_message[class_name]);
    msg_node = new_node.getElementsByClassName(class_name + '-content')[0];
    msg_node.insertAdjacentHTML('afterbegin', message);

    var chat = document.getElementById('conv-chat');
    chat.appendChild(new_node);

    chat.scrollTop = chat.scrollHeight;
}

function append_user_input(user_input) {
    append_message(user_input, 'conv-msg-user');
}

function append_bot_output(output_array) {
    output_array.forEach(function(output_text) {
        append_message(output_text, 'conv-msg-bot');
    });
    
}

function received_from_bot(response_text) {
    state.at_least_one_request_ok = true;
    var response = JSON.parse(response_text);
    if (!response) {
        bot_error();
        return;
    }

    var output_array = response.output.text;  // It's an array!
    var context = response.context;
    state.context = context;

    append_bot_output(output_array);
}

function bot_error() {
    if (!state.at_least_one_request_ok) {
        var chat_window = document.getElementById('chat-window');
        chat_window.classList.toggle('hidden');
    } else {
        append_bot_output(['ERROR: There was an error communicating with the bot.']);
    }
}

function send_to_bot(user_input) {
    var to_send = {
        'input': {'text': user_input},
        'context': state.context
    }

    var to_send_json = JSON.stringify(to_send);

    var request = new XMLHttpRequest();
    request.open('post', proxy_url);
    request.setRequestHeader('Content-Type', 'application/json');

    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            if (request.status > 201) {
                bot_error();
            } else {
                received_from_bot(request.responseText);
            }
        }
    };

    request.send(to_send_json);
}

function submitted(event) {
    event.preventDefault();

    var user_input = read_user_input();
    append_user_input(user_input);
    send_to_bot(user_input);
}

function show_hide() {
    state.shown = !state.shown;
    
    var chat = document.getElementById('conv-chat');
    chat.classList.toggle('hidden');
    var input = document.getElementById('conv-input-wrapper');
    input.classList.toggle('hidden');

    var chat_window = document.getElementById('chat-window');
    chat_window.classList.toggle('small');
    
    const mq = window.matchMedia("(min-width: 768px)");
    if (!mq.matches) {
        if (state.shown) {
            chat_window.classList.add('big');
        } else {
            chat_window.classList.remove('big');
        }
    } else {
        chat_window.classList.remove('big');
    }
}

function width_change(mq) {
    if (mq.matches) {
        // wide screen
        if (!state.shown) {
            show_hide();
        }
    } else {
        if (state.shown) {
            show_hide();
        }
    }
}

function init() {
    var chatElement = document.getElementById('chat-window');
    chatElement.insertAdjacentHTML('afterbegin', chat_window_html);

    var header = document.getElementById('conv-header');
    header.addEventListener('click', show_hide, true);

    const mq = window.matchMedia("(min-width: 768px)");
    mq.addListener(width_change);
    width_change(mq);

    var form = document.getElementById('conv-input');
    form.addEventListener('submit', submitted, true);
    
    var user_input_element = document.getElementById('conv-msg');
    user_input_element.focus();

    send_to_bot('');
}


init();
