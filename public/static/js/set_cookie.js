const MY_COOKIE_NAME = 'clicks';
var cps = parseFloat(get_cookie('cps'));

function begin(){
    var cval = get_cookie(MY_COOKIE_NAME);
    var cpsval = get_cookie('cps');
    var goal = Number.parseInt(get_cookie('goal'));
    update_display(cval);
    update_cps(cpsval);
    update_goal(cval, goal);
    document.getElementById("storehead").style.display = "none";
    document.getElementById("clicker").style.display = "none";
    document.getElementById("baker").style.display = "none";
    document.getElementById("machine").style.display = "none";
    document.getElementById("factory").style.display = "none";
    document.getElementById("colony").style.display = "none";
    document.getElementById("empire").style.display = "none";
}

function increment_and_update(){
    let id = null;
    const elem = document.getElementById("cookie");
    clearInterval(id);
    id = setInterval(frame, 7);
    dim = 410;
    inc = 2;
    function frame() {
        if (dim == 400) {
            elem.style.width = 400 + 'px';
            elem.style.height = 400 + 'px';
            clearInterval(id);
        } 
        else {
            elem.style.width = dim + 'px';
            elem.style.height = dim + 'px';
            if (dim >= 425){
                inc = -2;
            }
            dim += inc;
        }
    }
    var cval = parseFloat(get_cookie(MY_COOKIE_NAME));
    cval++;
    set_cookie(MY_COOKIE_NAME, cval);
    update_display(cval);
}

function update_display(cval){
    var p_display = document.getElementById('id_display');
    p_display.innerHTML = parseInt(cval);
}

function update_cps(cval){
    var p_display = document.getElementById('cps_display');
    p_display.innerHTML = Math.round(cval*1000)/1000;
}

function update_goal(cval, goal){
    var p_display = document.getElementById('goal');
    if(parseInt(cval) >= goal){
        goal *= 10;
        cps *= 2;
        set_cookie('cps', cps);
        update_cps(cps);
        decor();
    }
    set_cookie('goal', goal);
    p_display.innerHTML = goal;
}

function set_cookie(cookie_name, cval){
    document.cookie = `${cookie_name}=${cval};path=/`
}

function get_cookie(cookie_name){
    var decodedCookie = decodeURIComponent(document.cookie);
    return decodedCookie
    .split('; ')
    .find(row => row.startsWith(`${cookie_name}=`))
    .split('=')[1];
}

function reset() {
    set_cookie(MY_COOKIE_NAME, 0);
    set_cookie('cps', 0);
    set_cookie('goal', 1);
    update_display(0);
    update_cps(0);
    update_goal(0, 1);
    document.getElementById("storehead").style.display = "none";
    document.getElementById("clicker").style.display = "none";
    document.getElementById("baker").style.display = "none";
    document.getElementById("machine").style.display = "none";
    document.getElementById("factory").style.display = "none";
    document.getElementById("colony").style.display = "none";
    document.getElementById("empire").style.display = "none";
}

function add(){
    check();
    cps = parseFloat(get_cookie('cps'));
    var cval = parseFloat(get_cookie(MY_COOKIE_NAME));
    cval+= cps/10;
    set_cookie(MY_COOKIE_NAME, cval);
    update_display(cval);
    var goal = Number.parseInt(get_cookie('goal'));
    update_goal(cval, goal);
}

function clicker() {
    cps += 0.1;
    set_cookie('cps', cps);
    update_cps(cps);
    var cval = parseFloat(get_cookie(MY_COOKIE_NAME));
    cval -= 10;
    set_cookie(MY_COOKIE_NAME, cval);
    update_display(cval);
}

function baker() {
    cps += 1;
    set_cookie('cps', cps);
    update_cps(cps);
    var cval = parseFloat(get_cookie(MY_COOKIE_NAME));
    cval -= 50;
    set_cookie(MY_COOKIE_NAME, cval);
    update_display(cval);
    
}

function machine() {
    cps += 5;
    set_cookie('cps', cps);
    update_cps(cps);
    var cval = parseFloat(get_cookie(MY_COOKIE_NAME));
    cval -= 200;
    set_cookie(MY_COOKIE_NAME, cval);
    update_display(cval);
}

function factory() {
    cps += 100;
    set_cookie('cps', cps);
    update_cps(cps);
    var cval = parseFloat(get_cookie(MY_COOKIE_NAME));
    cval -= 2000;
    set_cookie(MY_COOKIE_NAME, cval);
    update_display(cval);
}

function colony() {
    cps += 100000;
    set_cookie('cps', cps);
    update_cps(cps);
    var cval = parseFloat(get_cookie(MY_COOKIE_NAME));
    cval -= 1000000;
    set_cookie(MY_COOKIE_NAME, cval);
    update_display(cval);
}

function empire() {
    cps += 10000000;
    set_cookie('cps', cps);
    update_cps(cps);
    var cval = parseFloat(get_cookie(MY_COOKIE_NAME));
    cval -= 1000000000;
    set_cookie(MY_COOKIE_NAME, cval);
    update_display(cval);
}

function check() {
    if(parseFloat(get_cookie(MY_COOKIE_NAME)) < 10)
        document.getElementById("clicker").disabled = true;
    else {
        document.getElementById("clicker").disabled = false;
        document.getElementById("clicker").style.display = "inline";
        document.getElementById("storehead").style.display = "block";
    }
    if(parseFloat(get_cookie(MY_COOKIE_NAME)) < 50)
        document.getElementById("baker").disabled = true;
    else {
        document.getElementById("baker").disabled = false;
        document.getElementById("baker").style.display = "inline";
    }
    if(parseFloat(get_cookie(MY_COOKIE_NAME)) < 200)
        document.getElementById("machine").disabled = true;
    else {
        document.getElementById("machine").disabled = false;
        document.getElementById("machine").style.display = "inline";
    }
    if(parseFloat(get_cookie(MY_COOKIE_NAME)) < 2000)
        document.getElementById("factory").disabled = true;
    else {
        document.getElementById("factory").disabled = false;
        document.getElementById("factory").style.display = "inline";
    }
    if(parseFloat(get_cookie(MY_COOKIE_NAME)) < 1000000)
        document.getElementById("colony").disabled = true;
    else {
        document.getElementById("colony").disabled = false;
        document.getElementById("colony").style.display = "inline";
    }
    if(parseFloat(get_cookie(MY_COOKIE_NAME)) < 1000000000)
        document.getElementById("empire").disabled = true;
    else {
        document.getElementById("empire").disabled = false;
        document.getElementById("empire").style.display = "inline";
    }
} 

function decor() {
    const celeb = document.getElementById("celebrate");
    celeb.style.animationName = 'flash2';
    celeb.style.animationDuration = '1s';
    setTimeout(function() {
        celeb.style.animationName = 'none';
    }, 1000);
    
}
begin();
setInterval(add, 100);