const request = require('request-promise');
const cheerio = require('cheerio');
const SteamUser = require('steam-user');
const account = new SteamUser();
const config = require('./botConfig.json');

let scrape = async () => {

    const url = 'https://atdodmantas.lv/';

    const response = await request(url);

    const $ = cheerio.load(response);

    let locArray = [];
    let descArray = [];
    let linkArray = [];
    let titleArray = [];
    let takenArray = [];
   
    let location;
    let description;
    let link;
    let title;
    let itemTaken;

    let takenS = $('div.thing-block > .w-row > .main-info').each((i, el) => {
        let itemTaken = $(el).find('h5.unavailable').text().replace(/\s\s+/g, '');
        takenArray.push(itemTaken);
    });

    let titleS = $('div.thing-block > .w-row > .main-info').each((i, el) => {
        title = $(el).find('h3.name').text().replace(/\s\s+/g, '');
        titleArray.push(title);
    });

    let locationS = $('div.thing-block > .w-row > .main-info > .info-block > .place').each((i, el) => {
        location = $(el).find('.location').text().replace(/\s\s+/g, '');
        locArray.push(location);
    });
    
    let descS = $('div.thing-block > .w-row > .main-info').each((i, el) => {
        description = $(el).find('.thing-text').text().replace(/\s\s+/g, '');
        descArray.push(description);
    });
    
    
    let linkS = $('div.thing-block > .bottom-info').each((i, el) => {
        link = $(el).find('a.open').attr('href');
        linkArray.push(link);
    });

    for (let i=0; i < titleS.length && linkS.length && descS.length && locationS.length && takenS.length; i++) {
        if (takenArray[i] === 'Diemžēl nokavējāt. Jau atdots.') {
            account.on('friendMessage', (steamID, message) => {account.chatMessage(steamID, `[PAŅEMTS] -${linkArray[i]}`);})
        } else {
            account.on('friendMessage', (steamID, message) => {
                if (message === 'mantas') {
                    account.chatMessage(steamID, `
                        Nosaukums: ${titleArray[i]}
                        Atrodas: ${locArray[i]}
                        Apraksts: ${descArray[i]}
                        Links: ${linkArray[i]}
                    `);
                }
            })
        }
    }

}

const logOnInformation = {
    accountName: config.accountName,
    password: config.password  
};

account.logOn(logOnInformation);

account.on('loggedOn', () => {
    account.setPersona(SteamUser.EPersonaState.Online);
});

scrape();
setInterval(scrape, 60000);