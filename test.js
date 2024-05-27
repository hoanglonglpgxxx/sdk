class ChatWindow {
    init(config) {
        this.site = config.site || '';
        this.siteId = config.siteId || '';
        this.myUserId = config.myUserId || '';
        this.chatGPTImg = config.chatGPTImg || '/Extra/ChatGPT/images/small-icon.png';
        this.title = config.title || 'Chat GPT';
        this.gridModuleParentId = config.gridModuleParentId || '';
        this.mid = config.mid || '';
        this.roomId = config.roomId || '';
        this.submitOption = config.submitOption || function () { };
        this.file = config.file || null;

        let p = `<div id="chat-GPT{quote(mid)}" class="chatGPT-icon">
        <a href="javascript:void(0);" class="chatGPT-icon-action">
          <img alt="ChatIcon" src="./big-icon.png" height="80" />
        </a>
        <span class="x-botchatGPT">
          <i class="vi vi-x-small"></i>
        </span>
      </div>
      <div id="chat-window" class="chat-window"></div>`;
        document.body.innerHTML += p;
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
        // Create main container
        let portal;
        const chatWindow = this.createElement('div', 'window-chatbot');

        // Create header
        const header = this.createElement('div', 'header padding-h-lg padding-v-sm align-center background-black color-white');

        const headerImgContainer = this.createElement('div', 'header-img');
        const headerImg = this.createElement('img', '', {
            src: this.chatGPTImg,
            alt: ''
        });
        headerImg.onerror = function () {
            this.src = '/Extra/ChatGPT/images/small-icon.png';
        };
        headerImgContainer.appendChild(headerImg);

        const headerTitle = this.createElement('div', 'header-title padding-h-sm title-md');
        headerTitle.textContent = this.title;

        const headerActions = this.createElement('div', 'header-actions d-flex flex-end');

        const fullWindowLink = this.createElement('a', 'padding-2xs title-lg color-white', {
            href: 'javascript:void(0)',
            'data-x-service': 'fullWindow'
        });
        fullWindowLink.innerHTML = '<i class="vi vi-maximize-open"></i>';

        const closeWindowLink = this.createElement('a', 'padding-2xs title-lg color-white', {
            href: 'javascript:void(0)',
            'data-x-service': 'closeWindow',
            'data-target': `#chat-GPT${this.gridModuleParentId}`
        });
        closeWindowLink.innerHTML = '<i class="vi vi-x-large"></i>';

        headerActions.appendChild(fullWindowLink);
        headerActions.appendChild(closeWindowLink);

        header.appendChild(headerImgContainer);
        header.appendChild(headerTitle);
        header.appendChild(headerActions);

        // Create body
        const body = this.createElement('div', 'body scroll-container');

        const content = this.createElement('div', 'content', {
            id: `loadModuleChatDetail${this.mid}`,
            style: 'position: relative'
        });

        const messageScroller = this.createElement('div', 'message-scroller list-message-chat padding-lg', {
            id: `list-message-chat${this.mid}`,
            'data-id': this.roomId || ''
        });

        const itemChat = document.createElement('div', 'message message-item margin-bottom-md d-flex');
        messageScroller.appendChild(itemChat);
        content.appendChild(messageScroller);
        body.appendChild(content);

        let time = this.getDate();
        console.log(time, time.elapsedHours, time.elapsedMinutes, time.elapsedSeconds);

        itemChat.innerHTML = `<div class="item-img">
        <img alt="" src="./small-icon.png" onerror="this.src='./small-icon.png';" />
    </div>
    <div class="item-content padding-left-sm">
        <div class="item-top margin-bottom-xs">
            <div class="name text-bold">{'Trợ lý ảo'}</div>
            <div class="time">${time.currentDay}</div>
        </div>
        <div class="item-bottom">
            <div class="title background-color-gray padding-v-xs padding-h-sm border-radius-xs background-5">${portal && portal?.message ? portal.message : 'Chào bạn. Mình là Trợ lý ảo hỗ trợ tự động. Mình có thể giúp gì cho bạn không?'}</div>
        </div>
    </div>`;

        // Create footer
        const footer = this.createElement('div', 'footer border-top border-width-base border-gray-lighten');

        const form = this.createElement('form', `form${this.mid} d-flex message-form flex-column`, {
            id: `form${this.mid}`,
            style: 'flex-direction: column'
        });

        const hiddenInput = this.createElement('input', '', {
            type: 'hidden',
            name: 'roomId',
            value: this.roomId || ''
        });

        const actions = document.createElement('div', 'extra-chatgpt-actions');
        form.appendChild(hiddenInput);
        form.appendChild(actions);
        footer.appendChild(form);


        const actionChild = document.createElement('div', 'list-action-chat full-width d-flex relative');
        actionChild.innerHTML = `<div id="input-message" contenteditable="true" class="message-content border-radius-xs border-solid border-gray-lighten padding-2xs margin-xs message-content{quote(mid)}" name="title"></div><div><button type="button" class="submit border-radius-xs title-sm padding-xs margin-xs submit-button{mid}"><i class="vi vi-send-right"></i></button></div>`;

        actions.appendChild(actionChild);

        // Append all parts to the main container
        chatWindow.appendChild(header);
        chatWindow.appendChild(body);
        chatWindow.appendChild(footer);

        // Call the init method for event binding
        this.initChat(chatWindow);

        return chatWindow;
    }

    getDate() {
        let currentDay = new Date().toLocaleString('en-us', { weekday: 'long' });

        let startDate = new Date();
        startDate.setHours(startDate.getHours() - 1);

        let elapsedMilliseconds = new Date() - startDate;
        let elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
        let elapsedMinutes = Math.floor(elapsedSeconds / 60);
        let elapsedHours = Math.floor(elapsedMinutes / 60);
        return {
            currentDay,
            elapsedHours,
            elapsedMinutes,
            elapsedSeconds
        };
    }

    initChat(chatWindow) {
        const moduleBody = $(chatWindow);
        const that = this;

        moduleBody.find('textarea').on('input', function () {
            that.resizeTextArea(this);
        });

        moduleBody.on('keypress', `.message-content${that.mid}, .message-content`, function (event) {
            const textHTML = $(this).find('div[contenteditable="true"]:first');
            let text = $('.input-message').val();
            if (event.which === 13 && !event.shiftKey) {
                event.preventDefault();
                if ($(this).val() || textHTML.html()) {
                    that.submitFunc(that.site, text, that.siteId);
                    textHTML.html('');
                } else {
                    /* VHV.alert("{'Vui lòng nhập %s', 'nội dung'}", {
                        delay: 3000,
                        type: 'error'
                    }); */
                    alert('Vui lòng nhập nội dung');
                }
                $('.changeHasImage').addClass('hidden');
                return false;
            }
        });

        moduleBody.on('click', `.submit-button${that.mid}, .submit`, function (event) {
            const title = $(this).parents('form').find('div[contenteditable="true"]:first');
            console.log(that.site);
            event.preventDefault();

            if (title.html() || that.file) {
                that.submitFunc(that.site, title.html(), that.siteId);
                that.addMessage(title.html(), 'me', that.file ?? null);

                $('.changeHasImage').addClass('hidden');
            } else {
                /* VHV.alert("{'Vui lòng nhập %s', 'nội dung'}", {
                       delay: 3000,
                       type: 'error'
                   }); */
                alert('Vui lòng nhập nội dung');
            }
            return false;
        }).on('click', '.chatBotOtherQuest', function (event) {
            event.preventDefault();
            that.submitOption(that.roomId, $(this).text());
        });

        /*
                 VHV.load('3rdparty/jQuery/tipsy/tipsy.css');
                VHV.load('3rdparty/jQuery/tipsy/tipsy.js', function () {
                    moduleBody.find('.tipsy-tooltip').tipsy({
                        gravity: 'n',
                        title: 'title',
                        html: true
                    });
                });
        
                VHV.load('3rdparty/Bootstrap/bootstrap3-editable/js/bootstrap-editable.min.js');
                $(`#form${that.mid}`).submit(function () {
                    const textarea = $(this).find('[name="title"]:first');
                    const textHTML = $(this).find('div[contenteditable="true"]:first');
        
                    if (textarea.val() || textHTML.html()) {
                        that.submitFunc(textarea);
                    } else {
                        VHV.alert("{'Vui lòng nhập %s', 'nội dung'}", {
                            delay: 3000,
                            type: 'error'
                        });
                    }
                    return false;
                }); */
    }

    submitFunc(site, input, siteId) {
        let mountpoint = `${site}/api/Project/STDV/ChatBot/Chat/send?text=${input}&site=${siteId}`;
        fetch(mountpoint)
            .then(res => res.json())
            .then(res => {
                console.log(res);
                let newMessage = document.createElement('div');
                let botAnswer = res.botAnswer;
                console.log(res.botAnswer.fullName);
                this.addMessage(res.message, '');
            });
    }

    addMessage(value, type, file) {
        let newMessage = document.createElement('div');
        let chatContainer = document.querySelector('.list-message-chat');

        newMessage.className = `message message-item margin-bottom-md d-flex today ${type ?? ''} comment-item chat-message`;

        newMessage.innerHTML = value;
        chatContainer.appendChild(newMessage);
    }

    resizeTextArea(textarea) {
        // Implement your textarea resize logic here
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }
}


