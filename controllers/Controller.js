module.exports = {

    index: (req, res) => {
        res.render('pages/index');
    },

    create: (req, res) => {
        res.render('pages/create');
    },

    store: (req, res) => {
        console.log(req.body);
    }
}