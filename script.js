//Default page and logged user view
function defaultPage(){
  if(localStorage.getItem("currentlyLoggedIn")){
    document.getElementById('login').style.display='none';
    document.getElementById('register').style.display='none';
    document.getElementById('logout').style.display='inline-block';
    document.getElementById('logintest').innerHTML='witaj '+localStorage.getItem("currentlyLoggedIn");
    document.getElementById("content").innerHTML=
    '<div id="flex-chart">\
      <div class="chart-container" >\
        <canvas id="myChart" ></canvas>\
        <p>Procentowy Podział Transakcji</p>\
      </div>\
      <div class="chart-container" >\
        <canvas id="myChart2" ></canvas>\
        <p>Saldo Konta </p>\
      </div>\
    </div>\
    <div id="filter">\
    <div>\
      <label>Typ Transakcji</label>\
      <select name="transactionType" id="transactionType" onchange="loadTable()">\
        <option value="all">Wszystkie</option>\
        <option value="income">Wpływy</option>\
        <option value="expenses">Wydatki</option>\
      </select>\
    </div>\
    <div>\
      <label>Opis</label>\
      <input type="text" name="description" id="description" onkeyup="loadTable()">\
    </div>\
    </div>\
    <br>\
    <div id="table" >\
    </div>';
    loadCharts();
    loadTable();
  }
  else{
    document.getElementById('login').style.display='inline-block';
    document.getElementById('register').style.display='inline-block';
    document.getElementById('logintest').innerHTML='';
    document.getElementById('logout').style.display='none';
    document.getElementById("content").innerHTML='\
    <h1>Lorem Ipsum</h1>\
    <h3>"Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit..."</h3><br>\
    <h3>"There is no one who loves pain itself, who seeks after it and wants to have it, simply because it is pain..."</h3><br>\
    <hr /><br>\
    <article>\
      <div id="Lorem-ipsum"><p>\
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n Duis dapibus vitae sem in gravida.\n Quisque ac scelerisque enim. Mauris sagittis justo leo, nec sagittis eros gravida ut.\n Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.\n Quisque ut interdum mi.\n Vestibulum tristique nisi pharetra aliquam rutrum.\n Etiam rhoncus pretium libero, eget luctus nibh lacinia eu.\n Nunc eget justo auctor, hendrerit enim quis, vestibulum tortor.\n Nam lobortis fringilla lectus eu vestibulum.\n Donec maximus, velit sit amet tristique vehicula, urna nibh accumsan tortor, et facilisis diam urna et arcu.\n\
        Donec eget nulla libero.\n Sed aliquet commodo nunc, id vulputate justo convallis in.\n Quisque ultrices tincidunt turpis, in varius tellus tincidunt eget.\n Etiam lobortis facilisis purus ac efficitur.\n Ut in finibus neque, at dictum diam.\n Cras eget augue at lacus consectetur luctus.\n Duis aliquam, diam ut sodales feugiat, lorem eros bibendum leo, at consectetur massa orci vel nisi.\n Maecenas viverra quis risus a faucibus.\n Maecenas vel turpis erat.\n Vestibulum eget felis tincidunt, mattis enim vitae, placerat sem.\n Ut vestibulum risus tellus, vitae dictum est consectetur nec.\n Proin eu mauris augue.\n Donec sit amet bibendum risus.\
      </p></div>\
    </article><br>';
  }
}
//getting JSON data
async function getJSON(){
  return await fetch("https://api.npoint.io/38edf0c5f3eb9ac768bd" ,{
      method: 'get',
      headers: {
          'X-Bin-Meta': false
      }
  }).then(response=>response.json())
}

//generating charts after getting a response
async function loadCharts() {
  const json = await this.getJSON();    
  //preparing data to generate pie and bar chart, 
  //pie chart is about income and expenses so we count those
  //bar chart will use the ballance of the end of the day so the first one for each day, because the order of our data is from newest to oldest
  //also for bar chart we will use days of the transactions without duplicates and we 
  var income=0;
  var expenses=0;
  var lastDayBalance=[];
  var days=[];
  //preparing the amount of expenses and incomes
  for (const key in json.transactions){
      if(json.transactions[key].type%2==0){
          expenses++;
      }
      else{
          income++;
      }
      if(!days.includes(json.transactions[key].date)){
          days.push(json.transactions[key].date);
          lastDayBalance.push(json.transactions[key].balance);
      }

  }
 
//generating pie chart 
 new Chart("myChart", {
  type: "pie",
  data: {
    labels: ["Wpływy","Wydatki"],
    datasets: [{
      backgroundColor: ['rgb(99, 255, 132)','rgb(255, 99, 132)'],
      data: [income,expenses]
    }]
  },
  options: {
    responsive:false,
  }
});

//reversing order of elements in tables
  days.reverse();
  lastDayBalance.reverse();
//generating bar chart
  new Chart("myChart2", {
    type: "bar",
    data: {
      labels: days,
      datasets: [{
        backgroundColor: ['rgb(255, 99, 132)','rgb(99, 255, 132)','rgb(99, 132, 255)'],
        data: lastDayBalance
      }]
    },
    options: {
      plugins: {
          legend: {
              display: false
          },
      },
      skipNull: true,
      responsive:false
    }
  });
}

//insert img tag with icon, icon depends on trasaction type id
function icon(id){
  if(id%2==0){
    return '<img class="icon" src="./icons/payment-icon.webp"></img>';
  }
  else{
    return '<img class="icon" src="./icons/hand-money-income-dollar-icon.webp"></img>'
  }
}
//generate transaction table
async function loadTable() {
  const table=document.getElementById('table');
  var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const json = await this.getJSON();
  //prepare table of transaction types for select
  //table types contains transaction type id which can be shown depending of the select element value
  const type=document.getElementById("transactionType").value;
  var types=[];
  if(type=="all")types=[1,2,3,4];
  else if(type=="income")types=[1,3];
  else types=[2,4];
  //get value from description input
  const description=document.getElementById("description").value;
  //check if user is on mobile device or not
  if(isMobile){
  //mobile table
  //prepare header of the table, 
  //table will have 3 columns and a hidden row for the rest of the data
    table.innerHTML=
      '<table id="jsTable">\
        <thead>\
          <tr>\
            <th>typ transakcji</th> <th>opis</th> <th>kwota</th> \
          </tr>\
        </thead>\
        <tbody>\
        </tbody>\
      </table>';
// generate body of table
    const tableJS = document.getElementById("jsTable").getElementsByTagName("tbody")[0];
    var rownr=0;
    var idnr=0;
    var date="";

    for (const key in json.transactions){
      //check if types table includes type of the current transaction
      //also check if input description value is empty or current transaction description includes input desctiption value  
      if(types.includes(json.transactions[key].type) && (description=='' || json.transactions[key].description.includes(description))){
        //for mobile show date over every transaction of that date
        //check if date value equals transaction date value
        //if not insert row with transaction date and insert it to date variable  
      if(date!=json.transactions[key].date){
        var newrow= tableJS.insertRow(rownr);
        var cell = newrow.insertCell(0);
        cell.colSpan="3";
        newrow.className="dateRow";
        cell.innerHTML =json.transactions[key].date;
        rownr++;
        date=json.transactions[key].date;
      }
      //insert row with type description amount 
      var row = tableJS.insertRow(rownr);
      var cell = row.insertCell(0);
      cell.innerHTML = icon(json.transactions[key].type);
      var cell1 = row.insertCell(1);
      cell1.innerHTML = json.transactions[key].description;
      var cell2 = row.insertCell(2);
      cell2.innerHTML = json.transactions[key].amount;
      row.id="row"+idnr;
      //every row will have onclick which will show a hidden row with date and ballance
      //and also will hide all other hidden rows if any of them are on the screen
      //another click on the same row will hide the hidden row which appeared
      row.onclick=function(){
        var hidden=document.getElementsByClassName("hiddenRow");
        var show=document.getElementById(this.id+"_hidden");
        for(var i=0;i<hidden.length;i++){
          if(hidden[i].id!=show.id)
          hidden[i].style.display="none";
        }
        if(show.style.display==="table-row"){ 
          show.style.display="none";
        }
        else{
          show.style.display="table-row";}
        }
      rownr++;
      //insert hidden row with rest of the transaction data
      var newrow= tableJS.insertRow(rownr);
      var cell = newrow.insertCell(0);
      cell.colSpan="3";
      newrow.className="hiddenRow";
      newrow.id="row"+idnr+"_hidden";
      cell.innerHTML = "data: "+json.transactions[key].date+", saldo:"+json.transactions[key].balance;
      rownr++;
      idnr++;
    }}
 }
  else{
  //desktop table
  //prepare header of table
  //table will have 5 columns 
    table.innerHTML=
      '<table id="jsTable">\
        <thead>\
          <tr>\
            <th>data</th> <th>typ transakcji</th> <th>opis</th> <th>kwota</th> <th>saldo</th>\
          </tr>\
        </thead>\
        <tbody>\
        </tbody>\
      </table>';
  //generate body of the table 
    var tableJS = document.getElementById("jsTable").getElementsByTagName("tbody")[0];
    var rownr=0;

    for (const key in json.transactions){
    //check if types table includes type of the current transaction
    //also check if input description value is empty or current transaction description includes input desctiption value  
      if(types.includes(json.transactions[key].type) && (description=='' || json.transactions[key].description.includes(description))){
        var row = tableJS.insertRow(rownr);
        var colnr=0;
        for(const value in json.transactions[key]){
          var cell = row.insertCell(colnr);
          if(value!=="type"){
            cell.innerHTML = json.transactions[key][value];
          }
          else{
            cell.innerHTML = icon(json.transactions[key][value]);
          }
          colnr++;
        }
        rownr++;
      }
    }
  }
}
//register page
function registerPage(){
  document.getElementById('register').style.display='none';
  document.getElementById('login').style.display='inline-block';
  document.getElementById('logout').style.display='none';
  document.getElementById("content").innerHTML=
  '<h1>Rejestracja</h1>\
  <form id="registerForm" autocomplete="off">\
    <ul>\
      <li>\
        <label>Nazwa użytkownika</label><br>\
        <input type="text" name="name" id="name" required minlength="6" maxlength="16"><br>\
      </li>\
      <li>\
        <label>Haslo</label><br>\
        <input type="text" name="password" id="password" minlength="6" required><br>\
      </li>\
      <li>\
        <label>Email </label><br>\
        <input type="email" name="emial" id="email" required><br>\
      </li>\
      <li>\
        <label>Potwierdz Email</label><br>\
        <input type="text" name="repeatEmail" id="repeatEmail" required><br>\
      </li>\
      <li>\
        <button id="confirm" class="button" onclick="register()">Zajerestruj</button>\
      </li>\
    </ul>\
  </form>';
}
//check if login name exist in localStorage
function isNameUnique(name){
  var exist=0;
  //for each element of localstorage check if elements name equals name 
  //if yes break the loop and return 1
  for (var i = 0; i < localStorage.length; i++) {
    var key=localStorage.key(i);
    var item=localStorage.getItem(key);
    var user=JSON.parse(item);
    if(user.name==name){ 
      exist++;
      break;
    }
  }
  return exist;
};

//check if email exist in localStorage
function isEmailUnique(email){
  //for each element of localstorage check if elements email equals email 
  //if yes break the loop and return 1
  var exist=0;
  for (var i = 0; i < localStorage.length; i++) {
    var key=localStorage.key(i);
    var item=localStorage.getItem(key);
    var user=JSON.parse(item);
    if(user.email==email){
      exist++;
      break;
    }
  }
  return exist;
};

async function hashPassword(password){
  const encoder = new TextEncoder();
  const encodedText = encoder.encode(password);
  //Array Buffer
  const hash = await crypto.subtle.digest('SHA-256',encodedText); 
  // convert buffer to byte array
  const hashArray = Array.from(new Uint8Array(hash));        
   // convert bytes to hex string             
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;

}

//register new user
async function register(){
  const form = document.getElementById('registerForm');
	const formElements = Array.from(form.elements);
  //contains atleast 5 letters 1 number and might contain / \ - _ [ ] 
  var loginRegExp=/([A-Z,a-z]{5,})([0-9]{1,})([\\])?([\/])?([\[])?([\]])?([\-])?([\_])?/;

  //eventListener to prevent refresh of the page
  form.addEventListener('submit',function(event){
    event.preventDefault();
  });

  //Form Validation
  //checking if email value and repeat email value are identical 
  if(formElements[2].value!==formElements[3].value){
    formElements[3].setCustomValidity("Mail nie jest identyczny!");
  }
  else{
    formElements[3].setCustomValidity("");
  }
//checking if name is allready used
  if(isNameUnique(formElements[0].value)){
    formElements[0].setCustomValidity("Nazwa użytkownika jest już zajęta!");
  }
  else{
    formElements[0].setCustomValidity("");
  }
//checking if email is allready used
  if(isEmailUnique(formElements[2].value)){
    formElements[2].setCustomValidity("Na ten mail jest już założone konto!");
  }
  else{
    formElements[2].setCustomValidity("");
  }
  if(!loginRegExp.test(formElements[0].value)){
    formElements[0].setCustomValidity("Prosimy o wykorzystanie przynajmniej 5 liter i 1 liczby, dozwolone są także / \ [ ] - _");
  }
  else{
    formElements[0].setCustomValidity("");
  }
  //checking HTML form validation
  if(form.checkValidity()===false){form.reportValidity();}
  else{
    //if no errors add user to the localStorage
    //first create object 
    var obj = new Object();
    obj.name=formElements[0].value;
    //hash password
    var hashText= await hashPassword(formElements[1].value);
    obj.password=hashText;
    obj.email=formElements[2].value;
    //change object into json string and add the string to localStorage
    var string=JSON.stringify(obj);
    localStorage.setItem(formElements[0].value,string);
    //Log in the user
    login(formElements[0].value);

  }
}

//login page
function loginPage(){
  document.getElementById('login').style.display='none';
  document.getElementById('register').style.display='inline-block';
  document.getElementById('logout').style.display='none';
  document.getElementById("content").innerHTML=
  '<h1>Logowanie</h1>\
  <form id="loginForm" method="post">\
    <ul>\
    <li>\
    <label>Nazwa użytkownika/Email</label><br>\
    <input type="text" name="name" id="name" required><br>\
    </li>\
    <li>\
    <label>Haslo</label><br>\
    <input type="password" name="password" id="password" required><br>\
    </li>\
    <li>\
    <button id="confirm" class="button" onclick="checkLoginData()">Zaloguj</button>\
    </li>\
  </form>';
}

//login
function login(username){
  localStorage.setItem("currentlyLoggedIn",username);
  defaultPage();
}

//logout
function logout(username){
  localStorage.removeItem("currentlyLoggedIn");
  defaultPage();
}

//checking form user data with data in localStorage in order to login user or show appropriate message
async function checkLoginData(){
  var correct=0;
  const form = document.getElementById('loginForm');
	const formElements = Array.from(form.elements);
//event listener to prevent page refresh
  form.addEventListener('submit',function(event){
  event.preventDefault();});
  
  //if password is not empty prepare custom error message
  if(formElements[1].value!==''){formElements[0].setCustomValidity("Nie znaleziono użytkownika lub podany email jest wolny, polecamy założyć konto");}
  else{formElements[0].setCustomValidity("");}
  
  for (var i = 0; i < localStorage.length; i++) {
    var key=localStorage.key(i);
    var item=localStorage.getItem(key);
    var user=JSON.parse(item);
    var username='';
    //check if username or email from form is indetical to the one in localstorage
    if(user.name==formElements[0].value || user.email==formElements[0].value){
      formElements[0].setCustomValidity("");
      //if yes chceck if password from form is identical to the password in storage
      var hashText= await hashPassword(formElements[1].value);
      if(user.password==hashText){
        //if yes save the username and break the loop
        correct++;
        username=user.name;
        formElements[1].setCustomValidity("");
        break;
      }
      else{
        //if not prepare error message
        formElements[1].setCustomValidity("Nie poprawne hasło");
        form.reportValidity();
        break;
      }
    }
  }
  //check if login data were correct
  if(correct){
    //if yes login the user
    
  login(username);
}
else{
  //if not show error message
  form.reportValidity();
}
  return correct;
};

