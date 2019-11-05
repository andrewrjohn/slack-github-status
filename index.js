const cheerio = require("cheerio");
const fetch = require("node-fetch");

let prevDownServices = [];

const main = async () => {
    const website = await fetch("https://www.githubstatus.com/")
        .then(res => res.text())
        .then(body => body);

    const $ = await cheerio.load(website);
    const s = $('.component-inner-container').toArray()

    const downServices = s.map((el) => {
        const service = $(el).children('.name').text().trim()
        const status = $(el).children('.component-status').text().trim()
        if (status.toLowerCase() !== "operational") {
            return {
                service,
                status
            }
        } else {
            return null
        }
    }).filter((x) => x)



    let blocks = [{
        type: "section",
        text: {
            type: "mrkdwn",
            text: "Services Down:"
        }
    }, ]

    downServices.map((dService) => {
        blocks = [
            ...blocks,
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*${dService.service}*: _${dService.status}_`
                }
            },
            {
                type: "divider"
            }
        ]
    })

    let body = {
        blocks,
        text: "GitHub Services Down"
    }

    if (prevDownServices.length !== downServices.length) {
        if (downServices.length === 0) {
            body = {
                text: "All Services Up & Running",
                blocks: [{
                    type: "section",
                    text: {
                        type: "mrkdown",
                        text: "*All Services Up & Running*"
                    }
                }]
            }
        }
        fetch('https://hooks.slack.com/services/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', {
            method: 'post',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            },
        })
        prevDownServices = downServices
    }

};

setInterval(main, 300000)