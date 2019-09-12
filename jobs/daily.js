const schedule = require('node-schedule');
const Email = require('../utils/email');
const User = require('../models/userModel');
const Post = require('../models/postModel');



const dailyJob = schedule.scheduleJob('*/10 * * * * *', async function () {
    const posts = await getPosts();
    const users = await getUsers();

    const url = process.env.LOCAL_URL + '/api/posts/';

    const postsHTMLArray = posts.map(post => {
        return `<li><a href="${url}${post.id}">${post.title} posted by:${post.author.name}</a></li>`
    })
    const rawHTML = postsHTMLArray.join("");

    //in for loop when i will be able to sent email more than once
    await new Email(users, "urltoResign").sendDaily(rawHTML);

    // to do in email : sanitize befor send


})

async function getPosts() {
    const posts = await Post.find({ privacy: 'public' }).select('title content').populate({
        path: 'author',
        select: 'name'
    });
    return posts;
}
async function getUsers() {

    //Ask mailtrap problem
    const users = await User.findOne({ role: { $ne: 'admin' } });
    return users;
}

module.exports = dailyJob;