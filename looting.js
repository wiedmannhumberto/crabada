const axios = require('axios');
var Web3 = require('web3');
var web3 = new Web3('https://api.avax.network/ext/bc/C/rpc');

var address = "".toLowerCase();
var private_key = "";

var timestamp = Date.now();
var sign = web3.eth.accounts.sign(address + '_' + timestamp, private_key).signature;

console.log(address, sign);

axios({
  method: 'post',
  url: 'https://api.crabada.com/crabada-user/public/login-signature',
  headers: {},
  data: {
    address: address,
    timestamp: timestamp,
		sign: sign
	}
}).then(resp => {
  //console.log(resp.data);
	var accessToken = resp.data.result.accessToken;
	
	//get our teams
	axios.get('https://idle-api.crabada.com/public/idle/teams?user_address=' + address).then(resp => {
		//console.log(resp.data.result);
    
    //find one AVAILABLE team
		for(let i = 0; i < resp.data.result.totalRecord; i++) {
      let team_id = resp.data.result.data[i].team_id;
      let status = resp.data.result.data[i].status;
      let faction = resp.data.result.data[i].faction;
      let battle_point = resp.data.result.data[i].battle_point;
			console.log(team_id + '\t' + status + '\t' + faction + '\t' + battle_point);
      
      if(status == 'AVAILABLE') {
        
        //attack here, ignore the battle_point & faction
        //bypass the captcha
        axios.get('http://172.105.206.181/api/captcha?key=test').then(resp => {
          console.log(resp.data);
          let captcha = resp.data;
                    
          axios.get('https://idle-api.crabada.com/public/idle/mines?looter_address=' + address + '&can_loot=1&limit=100').then(resp => {
            //console.log(team_id, resp.data.result);
            for(let j = 0; j < resp.data.result.totalRecord; j++) {
              let game_id = resp.data.result.data[j].game_id;
              let defense_point = resp.data.result.data[j].defense_point;
              let defense_faction = resp.data.result.data[j].faction;
              console.log(game_id, defense_point, defense_faction);
              
              axios({
                method: 'put',
                url: 'https://idle-api.crabada.com/public/idle/attack/' + game_id,
                headers: {'content-type': 'application/json', 'authorization': "Bearer " + accessToken, 'origin': 'https://play.crabada.com'},
                data: {
                  user_address: address,
                  team_id: team_id,
                  lot_number: captcha.lot_number,
                  pass_token: captcha.pass_token,
                  gen_time: captcha.gen_time,
                  captcha_output: captcha.captcha_output
                }
              }).then(resp => {
                console.log(resp);
                console.log("SUCCESS");
                // you can click the resend button now :)
              }).catch(function (error) {
                if (error.response) {
                  console.log(error.response.data);
                } else if (error.request) {
                  //console.log(error.request);
                } else {
                  //console.log('Error', error.message);
                }
                //console.log(error.config);
              });
              break;
            }
          });
        });
        break;
      }
		}
	});
});