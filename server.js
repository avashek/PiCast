var express = require('express'),
app = express(),
server = require('http').createServer(app),
path = require('path'),
io = require('socket.io').listen(server),
spawn = require('child_process').spawn,
exec = require('child_process').exec,
ip = require('ip');

app.set('port', process.env.TEST_PORT || 8080);
app.use(express.static(path.join(__dirname,'/src')));
const pipe = false;

app.get('/',(req,res)=>{
res.sendFile(__dirname+'/src/index.html');
})

io.sockets.on('connection', (socket) => {  
socket.on('video', (id) => {
  url = 'https://www.youtube.com/watch?v=' + id;
  const child = new spawn('youtube-dl', ['-g', '-f', '22/18', url]);
  const omx_url = '';

  if(pipe){
pipe = false; 
new exec('echo -n q > /tmp/pipe');
new exec('rm /tmp/pipe');
  }

  child.stdout.on('data', (data) => {
    console.log(data.toString());
    omxurl = data.toString().trim();
  });

  child.stdout.on('end', () => {
    new exec('mkfifo /tmp/pipe');
    new exec('omxplayer -o local "'+omxurl+'" < /tmp/pipe ');
    new exec('echo . > /tmp/pipe');
    pipe = true;
  });
  console.log('Casting '+id);
  console.log('\nStarting video...');
})
socket.on('key', (key) => {
  key = key.toString().trim();
  console.log('key', key);
  new exec('echo -n '+key+' > /tmp/pipe');
  
  if(key === 'q'){
    //new exec('rm /tmp/pipe');
    pipe = false;
  }
})
})

server.listen(app.get('port'), () => {
ip.address();
console.log('Picast running on http://'+ip.address() +':'+ app.get('port'));
console.log('');
})