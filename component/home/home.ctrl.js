const msalConfig = {
    auth: {
        clientId: '561f7a61-83a4-4c1c-8a4d-b5439f3dc50c',
        authority: 'https://login.microsoftonline.com/common/'
    }
};
let now = new Date();

const baseURL = 'https://graph.microsoft.com/v1.0/me/calendars';

function startpage() {
    return {
        msClient: null,
        msOptions: {
            scopes: ["user.read", "calendars.read.shared", "calendars.readWrite", "openid","profile"]
        },
        async login() {
            try {
                await this.msClient.loginPopup(this.msOptions)
                let account = await this.msClient.getAllAccounts();
                this.data.username = account[0].username;
                await this.authenticate();
                await this.loadCalendar();
                this.data.reauthenticate = false;
            } catch (error) {
                console.log(error);
            }
            this.save();
        },
        async authenticate() {
            let account = await this.msClient.getAllAccounts();
            if(account.length<1){
                let trigger = confirm('Reauthentication required');
                if(trigger){
                    this.data.reauthenticate = true;
                }
            } else {
                try {

                    let tokenResponse = await this.msClient.acquireTokenSilent({
                        scopes: this.msOptions.scopes,
                        account: account[0],
                        forceRefresh: false
                    });
                    this.data.accessToken = tokenResponse.accessToken;
                    this.data.refreshToken = tokenResponse.refreshToken;
                    return true;
                } catch (error) {
                    if (error instanceof msal.InteractionRequiredAuthError) {
                        // fallback to interaction when silent call fails
                        this.msOptions.loginHint = this.data.username;
                        await this.msClient.acquireTokenPopup(this.msOptions);
                    }
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
            showNewEvent: false,
            newEvent:{
                name:''
            },
            newBookmarkTitle: '',
            background: 0,
            time: false,
            accessToken: null,
            events: [],
            calendars:[],
            reauthenticate:false,
            expanded:false
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
        },
        save() {
            localStorage.setItem('startpage', JSON.stringify(this.data))
        },
        add(item, type) {
            this.data[type].push(item);
            this.data.expanded = true;
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
            {url: 'asset/pexels-pixabay-459225.jpg', author: 'PIXABAY'},
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
        parseLinks(raw){
          return raw.replace(/^https:\/\/[^\s]+/img, hit => `<a href="${hit}" target="_blank">${hit}</a>` )
        },
        convertToLocalDay(input){
            return this.convertToLocalTime(input).substring(0,5);
        },
        convertToLocalTime(input) {
            let target = new Date(input.replace('.0000000', '.000+00:00'));
            return target.toLocaleString('en-US', {hour12: false, day:'2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit'})
        },
        msHeader(){
            return {
                headers: {
                    Authorization: 'Bearer ' + this.data.accessToken
                }
            }
        },
        async writeCalendar(){
            let endTime = new Date(this.data.newEvent.start);
            endTime.setHours(endTime.getHours() + Number(this.data.newEvent.duration));


            const event = {
                subject: this.data.newEvent.name,
                body: {
                    contentType:'HTML',
                    content: this.data.newEvent.content
                },
                start: {
                    dateTime: this.data.newEvent.start,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                end: {
                    dateTime: endTime.toISOString().replace(/\.\d{3}[^$]*/,''),
                    timeZone: 'Greenwich Standard Time'
                    // timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }
            }

            await axios.post(`https://graph.microsoft.com/v1.0/me/calendar/events`, event, this.msHeader());
            this.data.newEvent = {
                name: '',
                duration: .5,
            }
            this.data.showNewEvent = false;
            return this.loadCalendar();
        },
        async loadCalendar() {

            let start = new Date(now.getTime() - (6 * 60 * 60 * 1000));
            let end = new Date(now.getTime() + (36 * 60 * 60 * 1000))

            try{
                const {data} = await axios.get(baseURL, this.msHeader());
                this.data.calendars = data.value;
                this.data.events = [];
                data.value.forEach(calendar => {
                    axios.get(`${baseURL}/${calendar.id}/calendarView?StartDateTime=${start.toISOString()}&EndDateTime=${end.toISOString()}`, this.msHeader())
                        .then(single => {
                            this.data.events = [...this.data.events, ...single.data.value];
                            this.data.events.sort((a, b) => new Date(a.start.dateTime).getTime() < new Date(b.start.dateTime).getTime() ? -1 : 1)
                        })
                        .catch(error => {
                            console.log(error)
                        });

                })
            } catch (e){
                if(e.response.statusText === 'Unauthorized'){
                    const reauth = await this.authenticate();
                    if(reauth){
                        this.loadCalendar();
                    }
                }
            }

            this.save()
        }

    };
}