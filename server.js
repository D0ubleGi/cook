require('dotenv').config({ path: './.env' });
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const { type } = require('os');
const { buffer } = require('stream/consumers');
const { all } = require('axios');
const { use } = require('react');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const server = http.createServer(app, {
  maxHeaderSize: 1024 * 1024 * 50
});

const MONGO_URI = process.env.MONGO_URI || 'your-backup-uri-here';
const PORT = process.env.PORT || 3000;

console.log("📦 MONGO_URI is:", MONGO_URI);

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

const userSchema = new mongoose.Schema({
  user: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

const IdSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  maxmum: { type: String, required: true }
}, { timestamps: true });
const Ids = mongoose.model('Ids', IdSchema);

const TaskSchema = new mongoose.Schema({
  user: { type: String, required: true },
  name: { type: String, required: true },
  id: { type: String, required: true }
}, { timestamps: true });
const Tasks = mongoose.model('Tasks', TaskSchema);

const RecipesSchema = new mongoose.Schema({
  user: { type: String, required: true },
  name: { type: String, required: true },
  id: { type: String, required: true }
}, { timestamps: true });
const Recipes = mongoose.model('Recipes', RecipesSchema);

const TasksSchemaa = new mongoose.Schema({
  id: {type: String, required:true},
  idd: {type: String, required: true},
  taskname: {type: String, required:true},
  tasktitle: {type: String, required:true},
  taskdescription: {type: String, required:true}},
  {timestamps: true});
  const Taskebi = mongoose.model('Taskebi', TasksSchemaa);

  const Codee = new mongoose.Schema({
    user: {type:String, required:true},
    code: {type:String, required:true}
  },
  {timestamps: true});
  const Code = mongoose.model('Codee',Codee);

  const RecipeSchema = new mongoose.Schema({
    id: {type: String, required: true},
    idd: {type: String, required: true},
    img: {type: Buffer, required: true},
    imgtype: {type: String, required:true},
    title: {type: String, required: true},
    subtitle: {type: String, required: true},
    time: {type: Number, required: true},
    hour: {type:String, required: true},
    rate: {type: Number, required: true},
    level: {type: String, required: true},
    amount: {type: Number, required:true},
    user: {type: String, required: true}
  },
    {timestamps: true});
    const Recipt = mongoose.model('Recipt',RecipeSchema);

    const deskShema = new mongoose.Schema({
      id: {type: String, required: true},
      html: {type:String, required: true}
    },
    {timestamps:true});
    const Desk = mongoose.model('Desk',deskShema);

    const favSchema = new mongoose.Schema({
      id: {type:String, required:true},
      user: {type:String, required:true}},
    {timestamps: true});
    const Favs = mongoose.model('Favs',favSchema);

    const Ratee = new mongoose.Schema({
      id: {type:String, required:true},
      user: {type:String, required:true}},
      {timestamps:true});
      const Rate = mongoose.model('Rate',Ratee);

const allowedOrigins = ["http://localhost:4200", "https://cook-x95d.onrender.com"];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.static('dist/cooking'));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/cooking/index.html'));
});
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["polling", "websocket"],
  pingTimeout: 200000,
  pingInterval: 30000
});


io.on('connection', (socket) => {
  console.log('🟢 New user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });


  socket.on('register', async (username, email, password) => {
    console.log('📩 Registering user:', username);
    try {
      const useremailExists = await User.findOne({ user: username, email: email });
      if (useremailExists) {
        console.log('❌ Email and username already exists');
        socket.emit('register-taken', 'eutaken');
        return;
      }

      const userExists = await User.findOne({ user: username });
      if (userExists) {
        console.log('❌ User already exists');
        socket.emit('register-taken', 'utaken');
        return;
      }

      const emailExists = await User.findOne({ email: email });
      if (emailExists) {
        console.log('❌ Email already exists');
        socket.emit('register-taken', 'etaken');
        return;
      }

      const newUser = new User({ user: username, email, password });
      await newUser.save();
      console.log('✅ User saved to DB');
      socket.emit('register-taken', 'added');
    } catch (err) {
      console.error('❌ Error saving user:', err.message);
      socket.emit('register-error', 'Error registering user');
    }
  });


   socket.on('signin', async (user, pass) => {
    const checkuser = await User.findOne({ user: user });
    const checkpassword = await User.findOne({ password: pass });
    const checkuserpass = await User.findOne({ user: user, password: pass });
    if (!checkuser) {
      console.log(`❌ User ${user} not found!`);
      socket.emit('wronguser', 'nousername');
      return;
    }
    if (!checkpassword) {
      console.log(`❌ Wrong password!`);
      socket.emit('wronguser', 'nopassword');
      return;
    }
    if (checkuserpass) {
      console.log(`✅ ${user} logged in!`);
      socket.emit('wronguser', 'logged', user);
    }
  });

    socket.on('Add', async (userr, id) => {
    const checkmax = await Ids.findOne({ id: id });
    const numuses = await Recipes.find({id:id });
    const ioo= await Recipes.findOne({user:userr,id:id});
    const haa=numuses;
    if(!checkmax){
      socket.emit('respi', 'errii');
      console.log("❌ Wrong id!");
      return;
    }
    if(ioo){
      socket.emit('respi','aro');
      console.log("❌ Already registered!");
      return;
    }
    if (haa.length < Number(checkmax.maxmum)) {
      
      const newuser = new Recipes({ user: userr, name: checkmax.name, id: id });
      await newuser.save();
      console.log('✅ Successfully added!');
      socket.emit('respi', 'addded');
    } else {
      console.log('❌ Max amount of users reached for this Id!');
      socket.emit('respi', 'erri');
    }
  });

socket.on('dakode',async (name,email,code)=>{
  await Code.deleteMany({user:name});
const codi = new Code({
  user:name,
  code:code
});
await codi.save();
console.log( `code for ${name} is - ${code}`);
socket.emit('daaemaili',email,name,code);
});


socket.on('dacheke',async (name,code,username,email,password)=>{
  const cod= await Code.findOne({user:name});
  if(code==cod.code){
    try{
       const newUser = new User({ user: username, email:email, password:password });
      await newUser.save();
      console.log('✅ User saved to DB');
      socket.emit('onchecki', 'added');
    } catch (err) {
      console.error('❌ Error saving user:', err.message);
      socket.emit('register-error', 'Error registering user');
    }
    await Code.deleteMany({user:name});
  }
  else{
    socket.emit('onchecki',"wrong");
  }
});

socket.on('reset',async(name,email,code)=>{
await Code.deleteMany({user:name});
const codi = new Code({
  user:name,
  code:code
});
await codi.save();
console.log( `New code for ${name} is - ${code}`);
socket.emit('daaemail',email,name,code);
});

socket.on('cheemail',async(email)=>{
const chek = await User.findOne({email:email});
if(!chek){
  socket.emit('checkedemail','wrong');
  return;
}
else{
  socket.emit('sendee',email,chek.user,chek.password);
  socket.emit('checkedemail','done');
}
});

socket.on('check', async (id, nami, maxmumi,useri) => {
    console.log('🔍 Checking ID:', id, maxmumi);
    const checkid = await Ids.findOne({ id: id });
    const checknam= await Ids.findOne({name:nami});
    if (checkid) {
      console.log('❌ This ID already exists!');
      socket.emit('resp', "exists");
    } 
   
    else {
      const newId = new Ids({ id: id, name: nami, maxmum: maxmumi });
      await newId.save();
      const newts = new Recipes({user:useri,name:nami, id:id});
      await newts.save();
      console.log('✅ New ID added!');
      socket.emit('resp', 'addd');
    }
  });

  socket.on('load', async (userr) => {
    const taskss = await Recipes.find({ user: userr });
    socket.emit('loaded', taskss);
  });


  socket.on('recipt', async(id)=>{
    const Receptebi = await Recipt.find({id:id});
    console.log(Receptebi.length);
    socket.emit('reciptebi',Receptebi);
  });

socket.on('sear', async (term, id) => {
  try {
    const result = await Recipt.find({
      id: id,
      title: { $regex: '^' + term, $options: 'i' }
    });
    socket.emit('reciptebi', result);
  } catch (err) {
    console.error(err);
  }
});

socket.on('filter',async (value,id,type)=>{console.log(value);
if(value==='time'){
  if(type==='Descending'){
const rawRecipes = await Recipt.aggregate([
  { $match: { id: id } },
  {
    $addFields: {
      timeInSeconds: {
        $switch: {
          branches: [
            { case: { $eq: ["$hour", "Hour"] }, then: { $multiply: ["$time", 3600] } },
            { case: { $eq: ["$hour", "Minute"] }, then: { $multiply: ["$time", 60] } },
            { case: { $eq: ["$hour", "Second"] }, then: "$time" }
          ],
          default: 0
        }
      }
    }
  },
  { $sort: { timeInSeconds: 1 } }
]);

const sortedRecipes = rawRecipes.map(r => new Recipt(r));

socket.emit('reciptebi', sortedRecipes);
  }

if (type === 'Ascending') {
  const rawRecipes = await Recipt.aggregate([
    { $match: { id: id } },
    {
      $addFields: {
        timeInSeconds: {
          $switch: {
            branches: [
              { case: { $eq: ["$hour", "Second"] }, then: "$time" },
              { case: { $eq: ["$hour", "Minute"] }, then: { $multiply: ["$time", 60] } },
              { case: { $eq: ["$hour", "Hour"] }, then: { $multiply: ["$time", 3600] } },
            ],
            default: 0
          }
        }
      }
    },
    { $sort: { timeInSeconds: -1 } } 
  ]);

  const sortedRecipes = rawRecipes.map(r => new Recipt(r));

  socket.emit('reciptebi', sortedRecipes);
}

}
if(value==='rating'){console.log('rating');
  if(type==='Decreasing'){
    const sortedRecipes = await Recipt.aggregate([
  { $match: { id: id } },   
  { $sort: { rate: 1 } }    
]);
  const sortedRecipess = sortedRecipes.map(r => new Recipt(r));
socket.emit('reciptebi',sortedRecipess);
  }
  if(type==='Increasing'){
      const sortedRecipes = await Recipt.aggregate([
  { $match: { id: id } },   
  { $sort: { rate: -1 } }    
]);
  const sortedRecipess = sortedRecipes.map(r => new Recipt(r));
socket.emit('reciptebi',sortedRecipess);
  }
}
if(value==='difficulty'){console.log('difficulty');
  if(type==='Decreasing'){
    const sortedRecipes = await Recipt.aggregate([
      { $match: { id: id } },
  {
    $addFields: {
      levelOrder: {
        $switch: {
          branches: [
            { case: { $eq: ["$level", "Easy"] }, then: 1 },
            { case: { $eq: ["$level", "Medium"] }, then: 2 },
            { case: { $eq: ["$level", "Hard"] }, then: 3 }
          ],
          default: 4
        }
      }
    }
  },
  { $sort: { levelOrder: 1 } } 
]);
  const sortedRecipess = sortedRecipes.map(r => new Recipt(r));
socket.emit('reciptebi',sortedRecipess);

  }
  if(type==='Increasing'){
    const sortedRecipes = await Recipt.aggregate([
      { $match: { id: id } },
  {
    $addFields: {
      levelOrder: {
        $switch: {
          branches: [
            { case: { $eq: ["$level", "Easy"] }, then: 1 },
            { case: { $eq: ["$level", "Medium"] }, then: 2 },
            { case: { $eq: ["$level", "Hard"] }, then: 3 }
          ],
          default: 4
        }
      }
    }
  },
  { $sort: { levelOrder: -1 } } 
]);
  const sortedRecipess = sortedRecipes.map(r => new Recipt(r));

socket.emit('reciptebi',sortedRecipess);
}
}

});
console
socket.on('addnew', async (recs) => {
  try {
    const imgBuffer = Buffer.from(recs.img, 'base64'); 
    const newi = new Recipt({
      id: recs.id,
      idd: recs.idd,
      img: imgBuffer,
      imgtype: recs.imgstype,
      title: recs.title,
      subtitle: recs.subtitle,
      time: recs.time,
      hour: recs.hour,
      rate: recs.rate,
      level: recs.level,
      amount: recs.amount,
      user: recs.user
    });
    await newi.save();
    console.log('Saved:', recs.id);
  } catch (err) {
    console.error('Error saving recipe:', err);
  }
  const co = await Recipt.find({id:recs.id});
  socket.emit('reciptebi',co);
});

socket.on('desk',async(id,html)=>{console.log(id);
  const deki = new Desk({
    id:id,
    html:html.content
  });
  await deki.save();
});

socket.on('getdesk',async (id)=>{
  const dek = await Desk.findOne({id:id});
  const info = await Recipt.findOne({idd:id});
  if(dek){
    socket.emit('getit',dek.html,info);
  }
});

socket.on('addrem',async (id,user)=>{
const fav = await Favs.findOne({id:id,user:user});
if(fav){
  await Favs.deleteOne({id:id,user:user});
  socket.emit('faved','del');
  console.log('done');
}
else{console.log('nope');
  socket.emit('faved','add');
  const haia = new Favs({
    id:id,
    user:user
  });
  await haia.save();
}
});

socket.on('chei',async(id,user)=>{
const hu = await Favs.findOne({id:id, user:user});
if(hu){
  socket.emit('vi','yes',id,user);
}
else{
  socket.emit('vi','no',id,user);
}
});

socket.on('remv', async (id,user)=>{
const haia = await Recipt.findOne({idd:id,user:user});
const mu = await Recipt.findOne({idd:id});
if(haia){
  socket.emit('meap',id,user);
}
else{
  socket.emit('meap','none',mu.user);
    console.log(4);

}
});

socket.on('dell', async (id,user)=>{
  const hai = await Recipt.findOne({idd:id});
  const hui = await Recipes.find({id:hai.id});
let obj = [];

for (const element of hui) {
    const as = await User.findOne({user:element.user});
   obj.push({ email: as.email, useri: as.user });
  }
await Recipt.deleteMany({idd:id});
console.log('Deleted');
socket.emit('delled',hai.title,obj,hai.idd);
obj=[];
});


socket.on('sende',async (user,useri,title)=>{console.log('senddd');
const usi = await User.findOne({user:user});
socket.emit('senkk',usi.email,user,useri,title);
});
app.post('/delete', async (req, res) => {
  const { email, responsee, title, id } = req.body;

  await Recipt.deleteOne({idd:id});
  await Favs.deleteMany({id:id});
  await Rate.deleteMany({id:id});
  console.log("deletedd");

  res.json({ status: 'ok', message: `Email sent to ${email}` });
});

socket.on('cui',async (id,user)=>{
const ch = await Rate.findOne({id:id,user:user});
if(ch){
socket.emit('kkj','yes');  
}
else{
socket.emit('kkj','no');
}
});

socket.on('rtet',async (id,rate,user)=>{
const rat = await Recipt.findOne({idd:id});
const rati = ((rat.rate * rat.amount) + rate) / (rat.amount+ 1) ;
const rot = rat.amount+1;

await Recipt.updateOne(
  {idd:id},
  {$set: {rate:rati,amount:rot}}
);
const rty = new Rate({
  id:id,
  user:user
});
await rty.save();
console.log(`${user} rated!`);
});


});
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});