class ChatWindow {
    init() {
        this.site = "https://stdvlocal.coquan.vn";
        // this.siteId = config.siteId || '';
        // this.myUserId = config.myUserId || '';
        // this.chatGPTImg = config.chatGPTImg || '/Extra/ChatGPT/images/small-icon.png';
        // this.title = config.title || 'Chat GPT';
        // this.roomId = config.roomId || '';
        // this.file = config.file || null;

        this.loadCSS('/sample.css');

        let allParams = this.getQueryParams();
        allParams.forEach(param => {
            console.log(this);
            this[param.key] = param.value;
        });

        /* if (VHV) {
            console.log(VHV.getTime());
        } */
        // this.loadCSS(`${this.site}/3rdparty/jQuery/tipsy/tipsy.css`);

        /* VHV.load('3rdparty/jQuery/tipsy/tipsy.js', function () {
            moduleBody.find('.tipsy-tooltip').tipsy({
                gravity: 'n',
                title: 'title',
                html: true
            });
        }); */

        let p = `<div id="chat-GPT" class="chatGPT-icon chatbot-icon"><a href="javascript:void(0);" class="chatGPT-icon-action"><img alt="ChatIcon" src="${this.chatGPTImg}" height="80" /></a><span class="x-botchat" id="x-botchat"><svg width="16" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.729 5.285 C 5.520 5.388,5.294 5.645,5.233 5.848 C 5.128 6.197,5.025 6.078,8.113 9.170 L 10.939 12.000 8.113 14.830 C 5.009 17.938,5.128 17.801,5.237 18.165 C 5.304 18.388,5.618 18.700,5.835 18.759 C 6.214 18.861,6.061 18.993,9.170 15.887 L 12.000 13.061 14.830 15.887 C 17.939 18.993,17.786 18.861,18.165 18.759 C 18.386 18.699,18.699 18.386,18.759 18.165 C 18.861 17.786,18.993 17.939,15.887 14.830 L 13.061 12.000 15.887 9.170 C 18.993 6.061,18.861 6.214,18.759 5.835 C 18.700 5.618,18.388 5.304,18.165 5.237 C 17.801 5.128,17.938 5.009,14.830 8.113 L 12.000 10.939 9.190 8.131 C 7.229 6.172,6.335 5.305,6.231 5.262 C 6.033 5.179,5.933 5.184,5.729 5.285 " stroke="none" fill-rule="evenodd" fill="black"></path></svg></span></div><div id="chat-window" class="chat-window"></div>`;
        document.body.innerHTML += p;

        this.initEvents();

        // this.initUsingIframe(); //TEST CASE TẠO IFRAME
        /*         let iframe = document.querySelector('#your-iframe-id'); // replace with your iframe id
        let iframeWindow = iframe.contentWindow || iframe.contentDocument;
        
        if (iframeWindow) {
            iframeWindow.initEvents = function() {
                // Your initEvents code here...
            };
        
            iframeWindow.initEvents();
        } */
    }

    getQueryParams() {
        let params = new URLSearchParams(window.location.search);
        let result = [];

        for (let param of params) {
            result.push({
                key: param[0],
                value: param[1]
            });
        }

        return result;
    }


    loadCSS(val) {
        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = val;
        document.head.appendChild(link);
    }

    loadScript(val) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = val;
            script.async = true;

            script.onerror = reject;

            script.onload = script.onreadystatechange = function () {
                const loadState = this.readyState;

                if (loadState && loadState !== 'loaded' && loadState !== 'complete') return;

                script.onload = script.onreadystatechange = null;

                resolve();
            };

            document.head.appendChild(script);
        });
    }

    initEvents() {
        let that = this,
            chatGPTIcon = document.querySelector('.chatGPT-icon'),
            xBotChat = document.querySelector('.x-botchat'),
            chatWindow = document.getElementById('chat-window'),
            iframe = this.createElement('iframe', '', {
                id: 'iframe'
            });
        chatGPTIcon.addEventListener('click', function (e) {
            e.stopPropagation();
            if (!document.querySelector('.window-chatbot')) {
                document.body.appendChild(iframe);
                var doc = document.getElementById('iframe').contentWindow.document;
                doc.open();
                doc.write(that.createChatWindow().innerHTML);
                doc.close();
            }
        });
        xBotChat.addEventListener('click', function (e) {
            e.stopPropagation();
            if (chatGPTIcon) {
                chatGPTIcon.remove();
                chatWindow.remove();
            }
        });
    }

    createElement(tag, classNames, attributes = {}) {
        const element = document.createElement(tag);
        if (classNames) {
            element.className = classNames;
        }
        for (const [key, value] of Object.entries(attributes)) {
            element.setAttribute(key, value);
        }
        return element;
    }

    createChatWindow() {
        let portal;
        const chatWindow = this.createElement('div', 'window-chatbot');

        const header = this.createElement('div', 'header align-center  ');

        const headerImgContainer = this.createElement('div', 'header-img');
        const headerImg = this.createElement('img', '', {
            src: this.chatGPTImg,
            alt: ''
        });
        headerImg.onerror = function () {
            this.src = '/Extra/ChatGPT/images/small-icon.png';
        };
        headerImgContainer.appendChild(headerImg);

        const headerTitle = this.createElement('div', 'header-title text-bold padding-h-sm title-md');
        headerTitle.textContent = this.title;

        const headerActions = this.createElement('div', 'header-actions d-flex  ');

        const fullWindowLink = this.createElement('a', 'full-window action-button', {
            href: 'javascript:void(0)',
            'data-x-service': 'fullWindow'
        });
        fullWindowLink.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.840 2.238 C 14.833 2.259,14.736 2.262,14.604 2.340 C 14.419 2.449,14.318 2.596,14.277 2.815 C 14.208 3.182,14.331 3.499,14.604 3.660 C 14.735 3.737,14.823 3.740,16.957 3.752 L 19.175 3.764 16.231 6.712 C 12.996 9.951,13.139 9.785,13.241 10.165 C 13.301 10.386,13.614 10.699,13.835 10.759 C 14.215 10.861,14.049 11.004,17.288 7.769 L 20.236 4.825 20.248 7.043 C 20.260 9.177,20.263 9.265,20.340 9.396 C 20.449 9.581,20.596 9.682,20.815 9.723 C 21.182 9.792,21.499 9.669,21.660 9.396 C 21.738 9.264,21.741 9.169,21.760 6.100 C 21.771 4.362,21.766 2.884,21.750 2.815 C 21.677 2.518,21.386 2.264,21.080 2.231 C 21.003 2.223,19.545 2.226,17.840 2.238 M9.800 13.245 C 9.691 13.277,9.012 13.933,6.710 16.232 L 3.760 19.179 3.758 17.079 C 3.757 15.925,3.741 14.902,3.723 14.806 C 3.653 14.443,3.418 14.268,3.000 14.268 C 2.582 14.268,2.347 14.444,2.278 14.806 C 2.259 14.902,2.243 16.380,2.240 18.091 L 2.235 21.203 2.328 21.370 C 2.429 21.552,2.621 21.702,2.815 21.750 C 2.884 21.766,4.362 21.771,6.100 21.760 C 9.169 21.741,9.264 21.738,9.396 21.660 C 9.581 21.551,9.682 21.404,9.723 21.185 C 9.792 20.818,9.669 20.501,9.396 20.340 C 9.265 20.263,9.177 20.260,7.043 20.248 L 4.825 20.236 7.769 17.288 C 10.399 14.655,10.718 14.322,10.759 14.169 C 10.893 13.658,10.312 13.097,9.800 13.245 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>';

        const closeWindowLink = this.createElement('a', 'close-window action-button', {
            href: 'javascript:void(0)',
        });
        closeWindowLink.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.729 3.285 C 3.520 3.388,3.294 3.645,3.233 3.848 C 3.127 4.202,2.932 3.985,7.113 8.170 L 10.939 12.000 7.113 15.830 C 2.914 20.033,3.126 19.796,3.237 20.165 C 3.304 20.388,3.618 20.700,3.835 20.759 C 4.219 20.862,3.962 21.092,8.170 16.887 L 12.000 13.061 15.830 16.887 C 20.038 21.092,19.781 20.862,20.165 20.759 C 20.386 20.699,20.699 20.386,20.759 20.165 C 20.862 19.781,21.092 20.038,16.887 15.830 L 13.061 12.000 16.887 8.170 C 21.092 3.962,20.862 4.219,20.759 3.835 C 20.700 3.618,20.388 3.304,20.165 3.237 C 19.796 3.126,20.033 2.914,15.830 7.113 L 12.000 10.939 8.190 7.131 C 5.506 4.449,4.336 3.305,4.231 3.262 C 4.033 3.179,3.933 3.184,3.729 3.285 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>';

        headerActions.appendChild(fullWindowLink);
        headerActions.appendChild(closeWindowLink);
        closeWindowLink.addEventListener('click', this.closeWindow);
        fullWindowLink.addEventListener('click', this.fullScreen);

        header.appendChild(headerImgContainer);
        header.appendChild(headerTitle);
        header.appendChild(headerActions);

        const body = this.createElement('div', 'body scroll-container');

        const content = this.createElement('div', 'content', {
            style: 'position: relative'
        });

        const messageScroller = this.createElement('div', 'message-scroller list-message-chat', {
            'data-id': this.roomId || ''
        });

        const itemChat = this.createElement('div', 'message message-item margin-bottom-md d-flex');
        messageScroller.appendChild(itemChat);
        content.appendChild(messageScroller);
        body.appendChild(content);

        let time = this.getDay();
        itemChat.innerHTML = `<div class="item-img">
        <img alt="" src="${this.chatGPTImg ? this.chatGPTImg : '/Extra/ChatGPT/images/small-icon.png'}" onerror="this.src='./small-icon.png';" />
    </div>
    <div class="item-content">
        <div class="item-top">
            <div class="name text-bold">Trợ lý ảo</div> <div class="time first-mess">${time}</div>
        </div>
        <div class="item-bottom">
            <div class="title">${portal?.message ? portal.message : 'Chào bạn. Mình là Trợ lý ảo hỗ trợ tự động. Mình có thể giúp gì cho bạn không?'}</div>
        </div>
    </div>`;

        const footer = this.createElement('div', 'footer');

        const form = this.createElement('form', `d-flex message-form`, {
            style: 'flex-direction: column'
        });

        const hiddenInput = this.createElement('input', '', {
            type: 'hidden',
            name: 'roomId',
            value: this.roomId || ''
        });
        const actions = this.createElement('div', 'list-action-chat full-width d-flex relative');
        actions.innerHTML = `<div id="input-message" contenteditable="true" class="message-content border-solid border-gray-lighten   message-content{quote(mid)}" name="title"></div><div><button type="button" class="submit submit-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.249 2.286 C 1.671 2.389,1.266 2.892,1.274 3.494 C 1.279 3.866,1.255 3.789,2.750 8.245 L 4.020 12.030 3.914 12.345 C 3.856 12.518,3.245 14.334,2.556 16.380 C 1.370 19.904,1.303 20.118,1.288 20.444 C 1.274 20.730,1.285 20.819,1.355 20.977 C 1.490 21.283,1.661 21.465,1.941 21.603 C 2.156 21.709,2.241 21.729,2.469 21.727 C 2.791 21.723,3.060 21.635,3.880 21.269 C 16.421 15.657,21.698 13.292,21.877 13.201 C 22.394 12.938,22.597 12.708,22.708 12.257 C 22.766 12.022,22.766 11.978,22.708 11.743 C 22.597 11.292,22.394 11.061,21.880 10.801 C 21.462 10.589,3.379 2.508,3.080 2.399 C 2.737 2.275,2.494 2.242,2.249 2.286 M11.970 7.992 C 16.870 10.185,20.880 11.989,20.880 12.001 C 20.880 12.035,2.955 20.048,2.931 20.024 C 2.919 20.013,3.457 18.378,4.126 16.392 L 5.342 12.780 8.121 12.760 L 10.900 12.740 11.051 12.646 C 11.270 12.510,11.338 12.357,11.339 12.000 C 11.340 11.642,11.246 11.452,11.009 11.334 C 10.869 11.264,10.695 11.259,8.094 11.248 L 5.328 11.237 4.124 7.637 C 3.462 5.657,2.920 4.018,2.920 3.994 C 2.920 3.970,2.950 3.963,2.990 3.978 C 3.029 3.993,7.070 5.799,11.970 7.992 " stroke="none" fill-rule="evenodd" fill="black"></path></svg></button></div>`;

        form.appendChild(hiddenInput);
        form.appendChild(actions);
        footer.appendChild(form);

        chatWindow.appendChild(header);
        chatWindow.appendChild(body);
        chatWindow.appendChild(footer);

        this.initChat(chatWindow);

        return chatWindow;
    }

    getDay() {
        let currentDay = new Date().toLocaleString('en-us', { weekday: 'long' });
        switch (currentDay) {
            case 'Monday': currentDay = 'Thứ hai'; break;
            case 'Tuesday': currentDay = 'Thứ ba'; break;
            case 'Wednesday': currentDay = 'Thứ tư'; break;
            case 'Thursday': currentDay = 'Thứ năm'; break;
            case 'Friday': currentDay = 'Thứ sáu'; break;
            case 'Saturday': currentDay = 'Thứ bảy'; break;
            case 'Sunday': currentDay = 'Chủ nhật'; break;
        }
        return currentDay;
    }

    notag(value) {
        if (value && typeof (value) === 'string') {
            value = value.replace(/&/g, '&amp;').replace(/'/g, '&#x27;')
                .replace(/"/g, '&quot;').replace(/</g, '&lt;')
                .replace(/>/g, '&gt;').replace(/\//g, '&#x2F;').replace(/\[\[b]]/g, '<b>')
                .replace(/\[\[&#x2F;b]]/g, '</b>');
        }
        return value;
    }

    alert(message, options) {
        let that = this;
        that.loadCSS(`${that.site}/3rdparty/jQuery/lobibox/css/lobibox.min.css`);
        that.loadScript(`${that.site}/3rdparty/jQuery/lobibox/js/lobibox.min.js`)
            .then(function () {
                if (!options) {
                    options = {
                        closeOnClick: true,
                        closable: true,
                    };
                }
                if (!options.title) {
                    switch (options.type) {
                        case 'success':
                            options.title = 'Thành công';
                            break;
                        case 'warning':
                            options.title = 'Cảnh báo';
                            break;
                        case 'error':
                            options.title = 'Có lỗi';
                            break;
                        default:
                            options.title = 'Thông báo';
                            break;
                    }
                }
                if (!options.msg) {
                    options.msg = message || (options.content || options.title);
                    if (!options.isHTML) {
                        options.msg = that.notag(options.msg);
                    }
                }
                if (!options.position) {
                    options.position = 'top right';
                }
                options.sound = false;
                if (options.msg.length > 100 && !options.width) {
                    options.width = 500;
                    if (options.msg.length > 600) {
                        options.messageHeight = 300;
                    }
                    else if (options.msg.length > 300) {
                        options.messageHeight = 200;
                    }
                }
                Lobibox[(options?.messageType) ? options.messageType : 'notify'](
                    options.type || 'info', options);
            });
    }

    initChat(chatWindow) {
        const that = this;

        /* chưa thấy chỗ dùng hàm này
        let textareas = chatWindow.querySelectorAll(' textarea');
        textareas.forEach(function (textarea) {
            console.log(textarea);
            textarea.addEventListener('input', function () {
                that.resizeTextArea(this);
            });
        });
 */

        let messageContentEl = chatWindow.querySelector(' .message-content');
        messageContentEl.addEventListener('keypress', function (e) {
            const textHTML = this.closest('form').querySelector('div[contenteditable="true"]:first-child');
            if (e.which === 13 && !e.shiftKey) {
                e.preventDefault();
                if (this.value || textHTML.innerHTML) {
                    that.submitFunc(textHTML);
                    // textHTML.innerHTML = '';
                } else {
                    that.alert("Vui lòng nhập nội dung", {
                        delay: 3000,
                        type: 'error'
                    });
                }
                document.querySelector('.changeHasImage')?.classList.add('hidden');
                return false;
            }
        });

        messageContentEl.addEventListener('paste', function (e) {
            e.preventDefault();
            let pasteData = e.clipboardData.getData('text'),
                sanitizedValue = document.createTextNode(pasteData).wholeText;

            document.execCommand('insertText', false, sanitizedValue);
        });

        let submitBtn = chatWindow.querySelector('.submit');
        submitBtn.addEventListener('click', function (e) {
            console.log('submit');
            const textHTML = this.closest('form').querySelector('div[contenteditable="true"]:first-child');
            e.preventDefault();

            if (textHTML.innerHTML || that.file) {
                that.submitFunc(textHTML);
                document.querySelector('.changeHasImage')?.classList.add('hidden');
            } else {
                that.alert("Vui lòng nhập nội dung", {
                    delay: 3000,
                    type: 'error'
                });
            }
            return false;
        });

        chatWindow.addEventListener('click', function (e) {
            if (e.target.classList.contains('chatBotOtherQuest')) {
                e.preventDefault();
                that.submitOption(that.roomId, e.target.textContent);
            }
        });

        /*  VHV.load('3rdparty/jQuery/tipsy/tipsy.css');
         VHV.load('3rdparty/jQuery/tipsy/tipsy.js', function () {
             moduleBody.find('.tipsy-tooltip').tipsy({
                 gravity: 'n',
                 title: 'title',
                 html: true
             });
         }); */
    }

    submitOption(roomId, text) {
        this.submitFunc(text, roomId, true);
        /* VHV.Model(that.submitService)({
            text: text
        }, function (response) {
            if (typeof (response) === 'string') {
                response = JSON.parse(response);
            }
            if (window['sendMessage' + that.id]) {
                if (!response.content) {
                    response.content = text;
                }
                if (!response.realContent) {
                    response.realContent = text;
                }
                if (!response.roomId) {
                    response.roomId = roomId;
                }
                if (!response.fullName) {
                    response.fullName = that.fullName;
                }
                if (!response.avatar) {
                    response.avatar = that.avatar;
                }
                window['sendMessage' + that.id](response);
            }
        }); */
    }

    submitFunc(el, roomId = '', isOption = false) {
        let that = this;
        let url = `${this.site}/api/Project/STDV/ChatBot/Chat/send?text=${isOption ? el : el.innerHTML}&site=${that.siteId}`;
        fetch(url, {
            method: 'POST',
            // body: JSON.stringify(options),
            // headers: {
            //     'Content-Type': 'application/json'
            // }
        })
            .then(res => res.json())
            .then(res => {
                console.log(res);
                let botAnswer = res.botAnswer;
                that.addMessage(res, isOption ? el : el.innerHTML);
            })
            .then(() => {
                if (!isOption) el.innerHTML = '';
            });
    }

    addMessage(res, input) {
        let newMessage = this.createElement('div'),
            botNewMessage = this.createElement('div'),
            chatContainer = document.querySelector('.list-message-chat'),
            day = this.getDay(),
            msg = input;


        newMessage.className = `message message-item margin-bottom-md d-flex today me-message comment-item chat-message`;
        botNewMessage.className = `message message-item margin-bottom-md d-flex today comment-item chat-message`;

        newMessage.innerHTML = `<div class="item-img"><img alt="" src="${this.chatGPTImg ? this.chatGPTImg : '/Extra/ChatGPT/images/small-icon.png'}" onerror="this.src='./small-icon.png';" /></div><div class="item-content"><div class="item-top"><div class="name text-bold">${res.fullName ?? 'Bạn'}</div> <div class="time my-time" data-time="${res.createdTime}">${day}</div></div><div class="item-bottom"><div class="title">${msg ?? ''}</div></div></div>`;
        //time của createdTime trả về đang lệch với hàm new Date()
        chatContainer.appendChild(newMessage);
        let updateTime = (timeEl, createdTime) => {
            let currentTime = new Date(),
                timeDifference = currentTime - createdTime + (59 * 1000),
                timeDifferenceInMinutes = Math.floor(timeDifference / 1000 / (timeDifference / 1000 > 60 ? 60 : 1));
            // console.log(currentTime, timeDifference, timeDifferenceInMinutes, timeEl);
            timeEl.textContent = `${timeDifferenceInMinutes}  ${timeDifference / 1000 > 60 ? 'phút' : 'giây'} trước`;
        };

        if (res.botAnswer) {
            let botRes = res.botAnswer;
            msg = botRes?.content;

            botNewMessage.innerHTML = `<div class="item-img"><img alt="" src="${botRes.avartar ? botRes.avartar : (this.chatGPTImg ? this.chatGPTImg : '/Extra/ChatGPT/images/small-icon.png')}" onerror="this.src='./small-icon.png';" /></div><div class="item-content"><div class="item-top"><div class="name text-bold">${botRes.fullName ?? 'Bạn'}</div> <div class="time bot-time" data-time="${res.botAnswer.createdTime}">${day}</div></div><div class="item-bottom"><div class="title">${msg ?? ''}</div></div></div>`;

            chatContainer.appendChild(botNewMessage);
        }

        let updateTimeInterval = () => {
            document.querySelectorAll('.time:not(.first-mess)').forEach(timeEl => {
                let createdTime = new Date(timeEl.dataset.time * 1000);
                updateTime(timeEl, createdTime);
            });
        };

        setInterval(updateTimeInterval, 2000);

        setTimeout(() => {
            clearInterval(updateTimeInterval);
            setInterval(updateTimeInterval, 15000);
        }, 60000);
    }

    resizeTextArea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    initUsingIframe() {
        var iframe = document.createElement('iframe');
        const chatActions = `<div class="list-action-chat full-width d-flex relative"><div id="input-message" contenteditable="true" class="message-content border-solid border-gray-lighten message-content" name="title"></div><div><button type="button" class="submit submit-button{mid}"> <svg width="16" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.249 2.286 C 1.671 2.389,1.266 2.892,1.274 3.494 C 1.279 3.866,1.255 3.789,2.750 8.245 L 4.020 12.030 3.914 12.345 C 3.856 12.518,3.245 14.334,2.556 16.380 C 1.370 19.904,1.303 20.118,1.288 20.444 C 1.274 20.730,1.285 20.819,1.355 20.977 C 1.490 21.283,1.661 21.465,1.941 21.603 C 2.156 21.709,2.241 21.729,2.469 21.727 C 2.791 21.723,3.060 21.635,3.880 21.269 C 16.421 15.657,21.698 13.292,21.877 13.201 C 22.394 12.938,22.597 12.708,22.708 12.257 C 22.766 12.022,22.766 11.978,22.708 11.743 C 22.597 11.292,22.394 11.061,21.880 10.801 C 21.462 10.589,3.379 2.508,3.080 2.399 C 2.737 2.275,2.494 2.242,2.249 2.286 M11.970 7.992 C 16.870 10.185,20.880 11.989,20.880 12.001 C 20.880 12.035,2.955 20.048,2.931 20.024 C 2.919 20.013,3.457 18.378,4.126 16.392 L 5.342 12.780 8.121 12.760 L 10.900 12.740 11.051 12.646 C 11.270 12.510,11.338 12.357,11.339 12.000 C 11.340 11.642,11.246 11.452,11.009 11.334 C 10.869 11.264,10.695 11.259,8.094 11.248 L 5.328 11.237 4.124 7.637 C 3.462 5.657,2.920 4.018,2.920 3.994 C 2.920 3.970,2.950 3.963,2.990 3.978 C 3.029 3.993,7.070 5.799,11.970 7.992 " stroke="none" fill-rule="evenodd" fill="black"></path></svg></button></div></div>`;

        document.body.appendChild(iframe);
    }

    closeWindow() {
        document.querySelector('.window-chatbot').remove();
    }

    fullScreen() {
        let chatWindow = document.querySelector('.window-chatbot'),
            fullBtn = document.querySelector('.full-window');
        if (!chatWindow.classList.contains('full-screen')) {
            chatWindow.classList.add('full-screen');
            fullBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.800 2.245 C 20.691 2.277,20.012 2.933,17.710 5.232 L 14.760 8.179 14.758 6.079 C 14.757 4.925,14.741 3.902,14.723 3.806 C 14.653 3.443,14.418 3.268,14.000 3.268 C 13.582 3.268,13.347 3.444,13.278 3.806 C 13.259 3.902,13.243 5.380,13.240 7.091 L 13.235 10.203 13.328 10.370 C 13.429 10.552,13.621 10.702,13.815 10.750 C 13.884 10.766,15.362 10.771,17.100 10.760 C 20.169 10.741,20.264 10.738,20.396 10.660 C 20.669 10.499,20.792 10.182,20.723 9.815 C 20.682 9.596,20.581 9.449,20.396 9.340 C 20.265 9.263,20.177 9.260,18.043 9.248 L 15.825 9.236 18.769 6.288 C 21.399 3.655,21.718 3.322,21.759 3.169 C 21.893 2.658,21.312 2.097,20.800 2.245 M6.840 13.238 C 3.833 13.259,3.736 13.262,3.604 13.340 C 3.419 13.449,3.318 13.596,3.277 13.815 C 3.208 14.182,3.331 14.499,3.604 14.660 C 3.735 14.737,3.823 14.740,5.957 14.752 L 8.175 14.764 5.231 17.712 C 1.996 20.951,2.139 20.785,2.241 21.165 C 2.301 21.386,2.614 21.699,2.835 21.759 C 3.215 21.861,3.049 22.004,6.288 18.769 L 9.236 15.825 9.248 18.043 C 9.260 20.177,9.263 20.265,9.340 20.396 C 9.501 20.669,9.818 20.792,10.185 20.723 C 10.404 20.682,10.551 20.581,10.660 20.396 C 10.738 20.264,10.741 20.169,10.760 17.100 C 10.771 15.362,10.766 13.884,10.750 13.815 C 10.677 13.518,10.386 13.264,10.080 13.231 C 10.003 13.223,8.545 13.226,6.840 13.238 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>';
        } else {
            chatWindow.classList.remove('full-screen');
            fullBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.840 2.238 C 14.833 2.259,14.736 2.262,14.604 2.340 C 14.419 2.449,14.318 2.596,14.277 2.815 C 14.208 3.182,14.331 3.499,14.604 3.660 C 14.735 3.737,14.823 3.740,16.957 3.752 L 19.175 3.764 16.231 6.712 C 12.996 9.951,13.139 9.785,13.241 10.165 C 13.301 10.386,13.614 10.699,13.835 10.759 C 14.215 10.861,14.049 11.004,17.288 7.769 L 20.236 4.825 20.248 7.043 C 20.260 9.177,20.263 9.265,20.340 9.396 C 20.449 9.581,20.596 9.682,20.815 9.723 C 21.182 9.792,21.499 9.669,21.660 9.396 C 21.738 9.264,21.741 9.169,21.760 6.100 C 21.771 4.362,21.766 2.884,21.750 2.815 C 21.677 2.518,21.386 2.264,21.080 2.231 C 21.003 2.223,19.545 2.226,17.840 2.238 M9.800 13.245 C 9.691 13.277,9.012 13.933,6.710 16.232 L 3.760 19.179 3.758 17.079 C 3.757 15.925,3.741 14.902,3.723 14.806 C 3.653 14.443,3.418 14.268,3.000 14.268 C 2.582 14.268,2.347 14.444,2.278 14.806 C 2.259 14.902,2.243 16.380,2.240 18.091 L 2.235 21.203 2.328 21.370 C 2.429 21.552,2.621 21.702,2.815 21.750 C 2.884 21.766,4.362 21.771,6.100 21.760 C 9.169 21.741,9.264 21.738,9.396 21.660 C 9.581 21.551,9.682 21.404,9.723 21.185 C 9.792 20.818,9.669 20.501,9.396 20.340 C 9.265 20.263,9.177 20.260,7.043 20.248 L 4.825 20.236 7.769 17.288 C 10.399 14.655,10.718 14.322,10.759 14.169 C 10.893 13.658,10.312 13.097,9.800 13.245 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>';
        }
    }
}


