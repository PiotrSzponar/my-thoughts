const schedule = require('node-schedule');
const Email = require('../utils/email');
const User = require('../models/userModel');
const Post = require('../models/postModel');

//getFriendsPosts();

getFriends();

const dailyJob = schedule.scheduleJob('*/10 * * * * *', async function () {
    const posts = await getPosts();
    const users = await getUsers();

    const url = process.env.LOCAL_URL + '/api/posts/';

    const postsHTMLArray = posts.map(post => {
        return `<li><a href="${url}${post.id}">${post.title} posted by:${post.author.name}</a></li>`
    })
    const rawHTML = postsHTMLArray.join("");

    //in for loop when i will be able to sent email more than once
    users.forEach(async (user) => {

        console.log("Waiting for promise to slow down sending mail");
        //Use this only in devmode and demonstraion to slowdown sending mails!
        const promise = await returnPromsie();
        console.log("sending mail")
        await new Email(user, "urltoResign").sendDaily(rawHTML);
    })


})


async function getFriends() {
    const user = await User.findById('5d7e65d78f0b7d09b8f3b268')
        .populate({
            path: 'friends',
            select: 'status',
            match: { status: 3 }
        })
        .select('recipient');

    console.log(user);
}

async function getFriendPosts(friendId) {
    const posts = await Post.find({ author: friendiD, privacy: 'friends' }).select('title content').populate({
        path: 'author',
        select: 'name'
    });
    console.log(posts)
    return posts;
}

async function getPosts() {
    const posts = await Post.find({ privacy: 'public' }).select('title content').populate({
        path: 'author',
        select: 'name'
    });
    return posts;
}
async function getUsers() {

    const users = await User.find({ role: { $ne: 'admin' } });
    return users;
}
function returnPromsie() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('foo');
        }, 3500)
    })
}


module.exports = dailyJob;