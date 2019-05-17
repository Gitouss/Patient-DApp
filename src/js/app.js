var keys, encABC;
App = {
  web3Provider: null,
  contracts: {},

  init: function() {

    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Mediblock.json', function(data) {
  // Get the necessary contract artifact file and instantiate it with truffle-contract
    var MediblockArtifact = data;
    App.contracts.Mediblock = TruffleContract(MediblockArtifact);

    // Set the provider for our contract
    App.contracts.Mediblock.setProvider(App.web3Provider);

    // Use our contract to retrieve and mark the adopted pets
  //  return App.markAdopted();
  });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-register', App.handleRegister);
    $(document).on('click', '.btn-patient', App.getPatient);
    $(document).on('click', '.btn-login', App.getLogin);
    $(document).on('click', '.btn-check-risk', App.checkRisk);
    $(document).on('click', '.btn-decrypt', App.decrypt);
  },

  getPatient: function(result, account) {
    var patientInstance;
    web3.eth.getAccounts(function(error, accounts) {
        var key = accounts[0];

      App.contracts.Mediblock.deployed().then(function(instance) {
        patientInstance = instance;
       console.log(key);
        return patientInstance.getPatient.call(key);
      }).then(function(data) {
        console.log(data);
      }).catch(function(err) {
        console.log(err.message);
      });
    })
  },
  decrypt: function(result, account) {
    var resultInstance;
    web3.eth.getAccounts(function(error, accounts) {
        var getKey = JSON.parse(localStorage.getItem("myKey"));
        var key = accounts[0];

      App.contracts.Mediblock.deployed().then(function(instance) {
        resultInstance = instance;

        return resultInstance.getPatientTest.call(localStorage.getItem("publicKey"));
      }).then(function(data) {
        console.log("...........................");
        console.log(data);
          console.log("...........................");
        keys.sec.decrypt(encAB).toString(10);
        $(".lblHash").empty().append("Encrypted Value: "+String(encABC)+"<br/>");
        var mainData = JSON.parse(data);
        $(".lblHash").append("Original Value: "+keys.sec.decrypt(encAB).toString(10));
      }).catch(function(err) {
        console.log(err.message);
      });
    })
  },
  getLogin: function(result, account) {
    var patientInstance;
      var errorBox = $("#error-box");
      var errorMsg =$("#error-msg");
      var key = $("#login-account").val();

      App.contracts.Mediblock.deployed().then(function(instance) {
        patientInstance = instance;
        return patientInstance.getPatient.call(key);
      }).then(function(data) {

        if(data.length>0){
          localStorage.setItem("publicKey", key);
          localStorage.setItem("patientInfo", JSON.stringify(data));
          console.log(data);
          window.location.href = "patientPersonalInfo.html";
        }
        else{
          errorBox.show();
          errorMsg.empty().html("Public key does not exist!");
        }

      }).catch(function(err) {
        console.log(err.message);
      });

  },
  checkRisk: function(result, account) {
      $('.modal').modal('show');
      var radioAlcohol =parseInt($('input[name=alcohol]:checked').val());
      var radioSmoke = parseInt($('input[name=smoke]:checked').val());
      var radioHistory = parseInt($('input[name=history]:checked').val());
      var radioGall = parseInt($('input[name=gall]:checked').val());
      var radioChemical = parseInt($('input[name=chemical]:checked').val());
      var radioAflatoxin = parseInt($('input[name=aflatoxin]:checked').val());
      inputValues = {
        "alcohol":radioAlcohol,
        "smoke":radioSmoke,
        "history":radioHistory,
        "gall":radioGall,
        "chemical":radioChemical,
        "aflatoxin":radioAflatoxin
      };
      localStorage.setItem("inputValues",JSON.stringify(inputValues));
      //Below code is for pailliers computation (Additive Homomorphic encryption)
      var secretKey,publicKey;
      var encA, encB;

      function generateKeys(){
        var numBits =1024;
        keys = paillier.generateKeys(numBits);
  		  publicKey =keys.pub.n.toString();
        secretKey = keys.sec.lambda.toString();
      }
      generateKeys();
      //encrypt user input
      var valA = (radioAlcohol+radioHistory+radioGall), valB = (radioSmoke+radioChemical+radioAflatoxin);
    //  console.log("valA: "+ valA+" valB: "+valB)
  		encA = keys.pub.encrypt(nbv(valA));
  		encB = keys.pub.encrypt(nbv(valB));
      //I am adding encrypted values at this points
      encAB = keys.pub.add(encA,encB);
      //I am ramdomnizing the added values at this point
      encAB = keys.pub.randomize(encAB);
      //I am multipying encAB value by 3000
      encABC = keys.pub.mult(encAB,nbv(1));
      //I am random multiplying
      encABC = keys.pub.randomize(encABC);
      //alert(encABC + " encrypted value :"+ keys.sec.decrypt(encABC).toString(10));
      web3.eth.getAccounts(function(error, accounts) {
          //var key = accounts[0];
        if (error) {
          console.log(error);
        }

        App.contracts.Mediblock.deployed().then(function(instance) {
          resultInstance = instance;
          var getKey = localStorage.getItem("publicKey");


          localStorage.setItem("myKey", JSON.stringify(keys));
        //  console.log(typeof encABC)

          return resultInstance.setPatientResult(getKey,String(encABC));

        }).then(function(result) {
          console.log(result);
          $('.modal').modal('hide');
          var sum = (valA+valB);
          localStorage.setItem("sum",JSON.stringify(sum));
          if(sum > 5){
            $("#img-wrapper").empty().html("<img src='images/high.gif'/><hr>")
          }else{
            $("#img-wrapper").empty().html("<img src='images/low.gif'/><hr>")
          }
          //return App.markAdopted();
        }).catch(function(err) {
          console.log(err.message);
          $('.modal').modal('hide');
        });
        })

  },

  handleRegister: function(event) {
    event.preventDefault();

  //  var petId = parseInt($(event.target).data('id'));

    var patientInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      App.contracts.Mediblock.deployed().then(function(instance) {
        patientInstance = instance;
        var fname = $("#fname").val();
        var lname = $("#lname").val();
        var gender = $("#gender").val();
        var phone = $("#phone").val();
        var email = $("#email").val();
        var address = $("#address").val();
        var dob = $("#dob").val();
        var eth_address = $("#eth_address").val();

        // Execute adopt as a transaction by sending account
      //  return patientInstance.adopt(petId, {from: account});
        // return patientInstance.setPatient(account,fname,lname,gender,phone,email,address,dob);
        return patientInstance.setPatient(eth_address,fname,lname,gender,phone,email,address,dob);
      }).then(function(result) {
        //return App.markAdopted();
        alert("Record has been saved to blockchain!")
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
