const msalConfig = {
    auth: {
        clientId: '561f7a61-83a4-4c1c-8a4d-b5439f3dc50c',
        authority: 'https://login.microsoftonline.com/common/'
    }
};
let now = new Date();

function startpage() {
    return {
        msClient: null,
        msOptions: {
            scopes: ["user.read", "calendars.read.shared"]
        },
        async login() {
            try {
                await this.msClient.loginPopup(this.msOptions)
                let account = await this.msClient.getAllAccounts();
                this.data.username = account[0].username;
                await this.authenticate();
                await this.loadCalendar();
            } catch (error) {
                console.log(error);
            }
            this.save();
        },
        async authenticate() {
            try {
                let account = await this.msClient.getAllAccounts();
                let tokenResponse = await this.msClient.acquireTokenSilent({
                    scopes: this.msOptions.scopes,
                    account: account[0],
                    forceRefresh: false
                });
                console.log(tokenResponse)
                this.data.accessToken = tokenResponse.accessToken;
                this.data.refreshToken = tokenResponse.refreshToken;
                return true;
            } catch (error) {
                if (error instanceof msal.InteractionRequiredAuthError) {
                    // fallback to interaction when silent call fails
                    this.options.loginHint = this.data.username;
                    await this.msClient.acquireTokenPopup(options);
                }
            }

        },
        data: {
            todo: [{todo: 'Buy more RAM', done: false}],
            bookmarks: [{url: 'https://neoan3.rocks', title: 'neoan3 docs'}],
            newTodo: '',
            showNewTodo: false,
            showNewBookmark: false,
            newBookmark: '',
            newBookmarkTitle: '',
            background: 0,
            time: false,
            accessToken: null,
            events: []
        },
        async init() {

            const storage = localStorage.getItem('startpage');
            if (storage) {
                this.data = JSON.parse(localStorage.startpage);
            } else {
                this.save()
            }

            this.msClient = new msal.PublicClientApplication(msalConfig);
            if (this.data.accessToken) {
                this.loadCalendar();
            }

            this.getTime()
            setInterval(() => this.getTime(), 10000);
            console.log(this.data)
        },
        save() {
            localStorage.setItem('startpage', JSON.stringify(this.data))
        },
        add(item, type) {
            this.data[type].push(item);
        },
        removeBookmark(bm) {
            this.data.bookmarks = this.data.bookmarks.filter(item => item.url !== bm.url)
            this.save();
        },
        addBookmark(ev) {
            ev.preventDefault();
            this.add({
                url: this.data.newBookmark,
                title: this.data.newBookmarkTitle
            }, 'bookmarks');
            this.data.newBookmark = '';
            this.data.newBookmarkTitle = '';
            this.save();
        },
        addTodo(ev) {
            ev.preventDefault();
            this.add({
                todo: this.data.newTodo,
                done: false
            }, 'todo');
            this.data.newTodo = '';
            this.save();
        },
        clearTodos() {
            this.data.todo = this.data.todo.filter(item => !item.done);
            this.save();
        },
        background: [
            {url: 'asset/bg.jpg', author: 'Martin Damboldt'},
            {url: 'asset/pexels-felix-mittermeier-1205301.jpg', author: 'Felix Mittermeier'},
            {url: 'asset/pexels-thibault-jugain-3992550.jpg', author: 'Thibault Jugain'},
            {url: 'asset/pexels-riccardo-bertolo-4245826.jpg', author: 'Riccardo Bertolo'},
            {url: 'asset/pexels-felix-mittermeier-957933.jpg', author: 'Felix Mittermeier'},
            {url: 'asset/pexels-eberhard-grossgasteiger-443446.jpg', author: 'eberhard grossgasteiger'},
            {url: 'asset/pexels-pixabay-219692.jpg', author: 'PIXABAY'},
        ],
        changeBackground(ev) {
            ev.preventDefault();
            this.data.background++;
            if (typeof this.background[this.data.background] === 'undefined') {
                this.data.background = 0;
            }
            this.save();
        },
        getTime() {
            let ima = new Date();
            this.data.time = ima.getHours().toString().padStart(2, '0') + ':' + ima.getMinutes().toString().padStart(2, '0');
        },
        convertToLocalTime(input) {

            let target = new Date(input.replace('.0000000', '.000+00:00'));
            return target.toLocaleString('en-US', {hour12: false, day:'2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit'})


        },
        async loadCalendar() {

            let start = new Date(now.getTime() - (6 * 60 * 60 * 1000));
            let end = new Date(now.getTime() + (36 * 60 * 60 * 1000))
            let options = {
                headers: {
                    Authorization: 'Bearer ' + this.data.accessToken
                }
            };
            let baseURL = 'https://graph.microsoft.com/v1.0/me/calendars';
            try{
                const {data} = await axios.get(baseURL, options);
                this.data.events = [];
                data.value.forEach(calendar => {
                    axios.get(`${baseURL}/${calendar.id}/calendarView?StartDateTime=${start.toISOString()}&EndDateTime=${end.toISOString()}`, options)
                        .then(single => {
                            this.data.events = [...this.data.events, ...single.data.value];
                            this.data.events.sort((a, b) => new Date(a.start.dateTime).getTime() < new Date(b.start.dateTime).getTime() ? -1 : 1)
                        })
                        .catch(error => {
                            console.log(error)
                        });

                })
            } catch (e){
                console.log(e.response)
                if(e.response.statusText === 'Unauthorized'){
                    const reauth = await this.authenticate();
                    console.log(reauth);
                    if(reauth){
                        this.loadCalendar();
                    }
                }
            }

            this.save()
        }

    };
}