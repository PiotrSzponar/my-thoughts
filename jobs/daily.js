const schedule = require('node-schedule');
const Email = require('../utils/email');
const User = require('../models/userModel');
const Post = require('../models/postModel');

getFriends();

const dailyJob = schedule.scheduleJob('* * 24 * * *', async function () {
    const posts = await getPosts();
    const users = await getUsers();

    const url = process.env.LOCAL_URL + '/api/posts/';

    const postsHTMLArray = posts.map(post => {
        return `<li><a href="${url}${post.id}">${post.title} posted by:${post.author.name}</a></li>`
    })
    const rawHTML = postsHTMLArray.join("");


    for (let user of users) {
        //in for loop when i will be able to sent email more than once
        console.log("Waiting for promise to slow down sending mail");
        //Use this only in devmode and demonstraion to slowdown sending mails!
        const promise = await returnPromsie();
        await new Email(user, "urltoResign").sendDaily(rawHTML);
        console.log("sending mail")

    }


})


async function getFriends(userid = '5d752fa8826ea343ecade1c2') {
    const user = await User.findById(userid)
        .populate({
            path: 'friends',
            select: 'status recipient',
            match: { status: 3 }
        })

    const friends = user.friends;
    friends.forEach(async (friend) => {
        const friendId = friend.recipient;
        console.log(friendId)
        const friendPosts = await getFriendPosts(friendId);
        console.log(friendPosts);
    });
}

async function getFriendPosts(friendId) {
    const posts = await Post.find({ author: friendId, privacy: 'friends' }).select('title content').populate({
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