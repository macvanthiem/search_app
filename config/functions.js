var natural = require('natural');
var tokenizer = new natural.AggressiveTokenizerVi({language: "fi"});
module.exports = {
    count_if: function (content) {
        content = tokenizer.tokenize(content);
        var n = content.length;
        for (let i = 0; i < n; i++) {
            content[i] = content[i].toLowerCase();   
        }
        var unique = [...new Set(content)];
        var danh_sach = new Map();
        for (let i = 0; i < unique.length; i++) {
            danh_sach.set(unique[i], 0);
        }
        for (let i = 0; i < n; i++) {
            if (danh_sach.has(content[i])) {
                danh_sach.set(content[i], danh_sach.get(content[i]) + 1);
            } 
        }

        for (let [key, value] of danh_sach) {
            danh_sach.set(key, value/n);
        }

        return danh_sach; 
    },

    unique: function (arr) {
        return Array.from(new Set(arr));
    },

    cosine: function (query_if_x_idf, post_if_x_idf) {
        let query = 0;
        let post =  0;
        let query_x_post = 0;
        for (let [key, value] of query_if_x_idf) {
            query_x_post += value*post_if_x_idf.get(key);
            query += Math.pow(value, 2);
            post += Math.pow(post_if_x_idf.get(key), 2);
        }
        query = Math.sqrt(query);
        post = Math.sqrt(post);

        return query_x_post/(query*post);
    },

    mix: function (cosine_arr, cosine_list) {
        let result = new Array();
        for (let i = 0; i < cosine_arr.length; i++) {
            for (let [key, value] of cosine_list) {
                if (cosine_arr[i] == value) {
                    result.push(key);
                }
            }
        }

        return [...new Set(result)];
    }

}