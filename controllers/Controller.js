const Post = require('../models/Post').Post;
const Word = require('../models/Word').Word;
const { count_if, unique, cosine, mix } = require('../config/functions');

module.exports = {

    index: (req, res) => {
        res.render('pages/index');
    },

    create: (req, res) => {
        res.render('pages/create');
    },

    store: (req, res) => {
        const newPost = new Post();

        newPost.title = req.body.title;
        newPost.content = req.body.content;

        let content = req.body.content;
        
        let danh_sach = count_if(content);

        for (let [key, value] of danh_sach) {
            newPost.normalized_if.push({word: key, _if: value});
        }

        newPost.save().then(data => {
            for (let [key, value] of danh_sach) {
                Word.findOne({title: key}).then(word => {
                    // console.log(word);
                    if (word) {
                        word.reverse_index_list.push(data);
                        word.save();
                    } else {
                        const newWord = new Word();
                        newWord.title = key;
                        newWord.reverse_index_list.push(data);
                        newWord.save();
                    }
                });
            }
            res.redirect('/create');
        }).catch(error => {
            console.log(error);
            res.redirect('/create');
        })
    },

    search: async (req, res) => {
        // Tinh if*idf cua cau query 
        const content = req.body.content;
        let query_if = count_if(content);
        // console.log(query_if);
        let all_posts = await Post.find().lean();
        let num_of_posts = all_posts.length;
        let query_idf = new Map();
        let query_if_x_idf = new Map();
        let list_posts_has_words = new Array;
        for (let [key, value] of query_if) {
            let word = await Word.findOne({title: key}).populate('reverse_index_list').lean();
            if (word) {
                let posts_has_word = word.reverse_index_list;
                let num_of_posts_has_word = posts_has_word.length;
                for (let i = 0; i < num_of_posts_has_word; i++) {
                    list_posts_has_words.push(posts_has_word[i].title);
                }
                let ln = num_of_posts/num_of_posts_has_word;
                query_idf.set(key, 1 + Math.log(ln));
                query_if_x_idf.set(key, (1 + Math.log(ln))*value);
            } 
        }
        // console.log(query_if_x_idf);
        let list_posts = unique(list_posts_has_words);
        let n_posts = list_posts.length;
        // console.log(query_idf);
        let cosine_list = new Map();
        let cosine_arr = new Array();
        for (let i = 0; i < n_posts; i++) {
            let post_title = list_posts[i];
            let post = await Post.findOne({title: post_title}).lean();
            if (post) {
                let normalized_if = post.normalized_if;
                let num_of_normalized_if = normalized_if.length;
                let if_x_idf = new Map();
                for (let [key, value] of query_idf) {
                    let flag = false;
                    for (let j = 0; j < num_of_normalized_if; j++) {
                        if (key == normalized_if[j].word) {
                            if_x_idf.set(key, value*normalized_if[j]._if);
                            flag = true;
                            break;
                        } 
                    }
                    if (!flag) {
                        if_x_idf.set(key, 0);
                    }
                }

                let cosine_value = cosine(query_if_x_idf, if_x_idf);
                cosine_arr.push(cosine_value);
                cosine_list.set(list_posts[i], cosine_value);
            }
        }
        cosine_arr.sort(function(a, b){return b - a});
        // console.log(cosine_arr);
        // console.log(cosine_list);
        let title_list = mix(cosine_arr, cosine_list);
        // console.log(title_list);
        let datas = new Array();
        for (let i = 0; i < title_list.length; i++) {
            let post = await Post.findOne({title: title_list[i]}).lean();
            datas.push(post);
        }
        // console.log(datas);
        res.render('pages/result', {datas: datas});
    },

    show: (req, res) => {
        let id = req.params.id;

        Post.findById(id).lean().then(data => {
            res.render('pages/detail', {data: data});
        }).catch(error => {
            res.render('pages/404');
        })
    },

    test: async (req, res) => {
        let json = require('../public/data/test.json');
        let json_lenth = json.length;
        let check = true;
        console.log(json_lenth);
        for (let index = 0; index < json_lenth; index++) {
            console.log(index);
            let newPost = new Post();

            newPost.title = json[index].title;
            newPost.date = json[index].date;
            newPost.desc = json[index].description;
            newPost.content = json[index].content;

            let content = json[index].content;
            
            let danh_sach = count_if(content);
            // console.log(danh_sach);

            for (let [key, value] of danh_sach) {
                newPost.normalized_if.push({word: key, _if: value});
            }

            let data = await newPost.save();

            for (let [key, value] of danh_sach) {
                let word = await Word.findOne({title: key});
                // console.log(word);
                if (word) {
                    word.reverse_index_list.push(data);
                    await word.save();
                } else {
                    let newWord = new Word();
                    newWord.title = key;
                    newWord.reverse_index_list.push(data);
                    await newWord.save(); 
                }
            }

            // newPost.save().then(data => {
            //     for (let [key, value] of danh_sach) {
            //         Word.findOne({title: key}).then(word => {
                        
            //             if (word) {
            //                 word.reverse_index_list.push(data);
            //                 word.save();
            //             } else {
            //                 let newWord = new Word();
            //                 newWord.title = key;
            //                 newWord.reverse_index_list.push(data);
            //                 newWord.save(); 
            //             }
            //         });
            //     }
            // }).catch(error => {
            //     console.log(error);
            //     check = false;
            // })
        }
        console.log('done');
        if (check) {
            res.redirect('/');
        } else {
            res.render('pages/error');
        }
        
    }
}