const express= require("express");
const mongoose= require("mongoose");
const session= require("express-session");
const passport= require("passport");
const passportLocalMongoose= require("passport-local-mongoose");

const app= express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(express.static("public"));

app.use(session({
    secret: "kjsdfnkldsmlaksjdoi9872615789oeidhas8918dhin0129j",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.set('strictQuery', true);
const url = "mongodb://127.0.0.1:27017/todoListDB";
mongoose.connect(url, {useNewUrlParser: true});

const itemSchema = new mongoose.Schema(
    {
        content: String,
        date: String,
        time: String
    }
);

const userSchema = new mongoose.Schema(
    {
        email: String,
        username: String,
        password: String,
        todoList: [itemSchema]
    }
);

userSchema.plugin(passportLocalMongoose, {usernameField: "email"});

const Item = mongoose.model("Item", itemSchema);
const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res)=>{
    res.sendFile(__dirname+"/public/html/index.html");
});
app.get("/login", (req, res)=>{
    res.render("login", {error: req.query.error});
});
app.get("/register", (req, res)=>{
    res.render("register", {error: req.query.error});
});

app.get("/list", (req, res)=>{
    if(req.isAuthenticated()){
        res.render("index", {fullList: req.user.todoList, username: req.user.username, date: new Date()});
    }
    else{
        res.redirect("/");
    }
});

app.get("/logout", (req, res)=>{
    req.logout((err)=>{
        if(err) res.send(err);
        res.redirect("/");
    });
});

app.post("/login", (req, res)=>{
    const user= new User({
        email: req.body.email,
        password: req.body.password
    });

    req.login(user, (err)=>{
        if(err){
            console.log(err);
            res.redirect("/login?error=true");
        }
        else{
            passport.authenticate("local")(req, res, ()=>{
                res.redirect("/list");
            });
        }
    });
});

app.post("/register", (req, res)=>{
    const newUser = new User({
        email: req.body.email,
        username: req.body.name
    });

    User.register(newUser, req.body.password, (err, user)=>{
        if(err){
            console.log(err);
            res.redirect("/register?error=true");
        }
        else{
            passport.authenticate("local")(req, res, ()=>{
                res.redirect("/list");
            });
        }
    });
});

app.get("/tasks", (req, res)=>{
    res.send(req.user.todoList);
})

app.post("/add", (req, res)=>{
    if(req.isAuthenticated()){
        if(req.body.newItem=="" || (req.body.date!="" && req.body.time=="") || (req.body.date=="" && req.body.time!="")) {
            res.redirect("/list");
            return;
        }
        
        const newItem = new Item(
            {
                content: req.body.newItem,
                date: req.body.date,
                time: req.body.time.split(":").join("-")
            }
        )

        req.user.todoList.push(newItem);
        newItem.save();
        req.user.save();
        
        // User.aggregate([
        //     {
        //         $set: {
        //             todoList: {
        //                 $sortArray : {
        //                     input: "Ite"
        //                 }
        //             }
        //         }
        //     }
        // ]);

        res.redirect("/list");
    }
    else{
        res.redirect("/");
    }
});

app.post("/delete", (req, res)=>{
    if(req.isAuthenticated()){
        Item.findByIdAndRemove(req.body.checkbox, (err)=>{
            if(err){
                console.log(err);
            }
            else{
                User.updateOne(
                    {email: req.user.email},
                    {
                        $pull: {todoList: {_id: req.body.checkbox}}
                    },
                    (err)=>{
                        if(err) console.log(err);
                    }
                );
            }
            
            res.redirect("/list");
        });
    }
    else{
        res.redirect("/");
    }
});

app.get("/getTasks", (req, res)=>{
    res.send(req.user.todoList);
})


app.listen(80, ()=>console.log("Server listening to port 80"));