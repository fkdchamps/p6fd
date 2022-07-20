module.exports = (req, res, next) => {
   
        let varEmail = req.body.email;
        console.log("mail", varEmail, varEmail.typeOf);
        const regXvarEmail = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
        console.log("test", regXvarEmail.test(varEmail));
        if (regXvarEmail.test(varEmail)===true) {
            console.log("test", regXvarEmail.test(varEmail));
            next();
        } else {
            res.status(401).json({"erreur":"email non-valide"});

        }
}
