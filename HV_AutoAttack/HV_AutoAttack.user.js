// ==UserScript==
// @name        HV_AutoAttack
// @name:zh-CN  【HV】HV自动打怪
// @name:zh-TW  【HV】HV自動打怪
// @author      Dodying
// @namespace   https://github.com/dodying/Dodying-UserJs
// @supportURL  https://github.com/dodying/Dodying-UserJs/issues
// @icon        http://cdn4.iconfinder.com/data/icons/mood-smiles/80/mood-29-48.png
// @description HV auto attack script, for the first user, should configure before use it.
// @description:zh-CN HV自动打怪脚本，初次使用，请先设置好选项
// @description:zh-TW HV自動打怪腳本，初次使用，請先設置好選項
// @include     http://hentaiverse.org/*
// @version     2.346
// @grant       none
// @run-at      document-end
// ==/UserScript==
if (document.querySelector('form[name="ipb_login_form"]')) return;
if (document.querySelector('img[src="http://ehgt.org/g/derpy.gif"]')) window.location = window.location.href;
/*
if (!localStorage.HVAA_Language) {
  var language = parseInt(prompt('Choose a language, plz\r\n请选择一个语言\r\n1.Englsh\r\n2.中文简体\r\n3.中文繁体'));
  localStorage.HVAA_Language = language;
} else {
  var language = parseInt(localStorage.HVAA_Language);
}
*/
OptionButton();
if (localStorage.HVAA_Setting) {
  var HVAA_Setting = JSON.parse(localStorage.HVAA_Setting);
  //console.log(HVAA_Setting);
  if (HVAA_Setting.version !== GM_info.script.version) {
    alert('HV-AutoAttack版本更新，请重新设置\r\n强烈推荐【重置设置】后再设置。');
    document.querySelector('#HV_AutoAttack_Option').style.display = 'block';
    document.querySelector('#HVAA_Setting_Clear').focus();
    window.HVAA_End = true;
  }
} else {
  alert('请设置HV-AutoAttack');
  document.querySelector('#HV_AutoAttack_Option').style.display = 'block';
}
RiddleAlert(); //答题警报
if (!document.querySelector('#togpane_log')) {
  removeItemInStorage(2);
  return;
}
HotKey(); //设置全局快捷键
if (localStorage.HVAA_disabled) { //如果禁用
  document.title = '[HVAA_暂停]' + document.title;
  return;
} else { //如果没有禁用
  if (!localStorage.HVAA_Attack_Status) {
    var Attack_Status = HVAA_Setting.Attack_Status;
  } else {
    var Attack_Status = localStorage.HVAA_Attack_Status;
  }
  if (HVAA_Setting.Delay_Alert) {
    setTimeout(function () {
      OtherAlert();
    }, HVAA_Setting.Delay_Alert_Time * 1000);
  }
  if (HVAA_Setting.Delay_Reload) {
    setTimeout(function () {
      window.location = window.location.href;
    }, HVAA_Setting.Delay_Reload_Time * 1000);
  }
  if (HVAA_Setting.Reloader) {
    setInterval(main, HVAA_Setting.Reloader_Time * 1000);
  } else {
    main();
  }
} //////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

function main() {
  if (window.HVAA_End) return;
  window.Monster_Count_All = document.querySelectorAll('div.btm1').length;
  window.Monster_Count_Dead = document.querySelectorAll('img[src*="/s/nbardead.png"]').length;
  window.Monster_Count_Alive = Monster_Count_All - Monster_Count_Dead;
  window.Monster_Count_Boss = document.querySelectorAll('div.btm2[style^=\'background:\']').length;
  window.Monster_Count_Boss_Dead = document.querySelectorAll('div.btm1[style*=\'opacity:\'] div.btm2[style*=\'background:\']').length;
  window.Monster_Count_Boss_Alive = Monster_Count_Boss - Monster_Count_Boss_Dead;
  if (localStorage.HVAA_Monster) {
    window.Monster = JSON.parse(localStorage.HVAA_Monster);
  } else {
    window.Monster = {
    };
  }
  CountRound(); //回合计数及自动前进并获取怪物Hp
  window.HP = document.querySelectorAll('.cwb2') [0].offsetWidth / 120;
  window.MP = document.querySelectorAll('.cwb2') [1].offsetWidth / 120;
  window.SP = document.querySelectorAll('.cwb2') [2].offsetWidth / 120;
  window.oc = document.querySelectorAll('.cwb2') [3].offsetWidth / 120;
  AutoUseGem(); //自动使用宝石
  DeadSoon(); //自动回血回魔
  //AutoReuseExpiringSkill(); //自动重新使用将要消失的技能
  AutoUsePotAndSuSkill(); //自动使用药水、增益技能
  //AutoUseDeSkill(); //自动使用De技能
  AutoAttack(); //自动打怪
} //////////////////////////////////////////////////

function removeItemInStorage(i) {
  localStorage.removeItem('HVAA_disabled');
  if (i > 0) {
    localStorage.removeItem('HVAA_Round_Now');
    localStorage.removeItem('HVAA_Round_All');
    localStorage.removeItem('HVAA_Monster');
    if (i > 1) {
      localStorage.removeItem('HVAA_Round_Type');
      localStorage.removeItem('HVAA_Attack_Status');
    }
  }
} //////////////////////////////////////////////////

function OptionButton() { //配置
  var HV_AutoAttack_Button = document.createElement('div');
  HV_AutoAttack_Button.id = 'HV_AutoAttack_Button';
  var Left = window.innerWidth - 225;
  HV_AutoAttack_Button.style = 'top:4px;left:' + Left + 'px;position:absolute;z-index:999;';
  HV_AutoAttack_Button.innerHTML = '<a href="javascript:void(0)"><img src="https://cdn0.iconfinder.com/data/icons/thinico/88/thinico-17-24.png" /></a>';
  HV_AutoAttack_Button.querySelector('a').onclick = function () {
    if (document.querySelector('#HV_AutoAttack_Option').style.display === 'none') {
      document.querySelector('#HV_AutoAttack_Option').style.display = 'block';
    } else {
      document.querySelector('#HV_AutoAttack_Option').style.display = 'none';
    }
  };
  document.body.appendChild(HV_AutoAttack_Button);
  var HV_AutoAttack_Option = document.createElement('div');
  HV_AutoAttack_Option.id = 'HV_AutoAttack_Option';
  Left = document.documentElement.clientWidth / 2 - 300;
  HV_AutoAttack_Option.style = 'font-size:large;z-index:999;width:600px;display:none;background-color:white;position:absolute;left:' + Left + 'px;top:110px;border-color:black;border-style:solid;text-align:left;';
  HV_AutoAttack_Option.innerHTML = '<h1 style="text-align:center;">HV AutoAttack设置&nbsp;<button id="HVAA_Setting_Clear"onclick="localStorage.removeItem(\'HVAA_Setting\');location.reload();"title="推荐每次更新后点击一次">重置设置</button></h1><div style="text-align:center;"><span style="color:green;">HP1:<input class="HVAA_DeadSoon"name="HVAA_HP1"style="width:24px;"placeholder="50"type="text">%&nbsp;HP2:<input class="HVAA_DeadSoon"name="HVAA_HP2"style="width:24px;"placeholder="44"type="text">%&nbsp;</span><span style="color:blue;">MP1:<input class="HVAA_DeadSoon"name="HVAA_MP1"style="width:24px;"placeholder="70"type="text">%&nbsp;MP2:<input class="HVAA_DeadSoon"name="HVAA_MP2"style="width:24px;"placeholder="10"type="text">%&nbsp;</span><span style="color:red;">SP1:<input class="HVAA_DeadSoon"name="HVAA_SP1"style="width:24px;"placeholder="75"type="text">%&nbsp;SP2:<input class="HVAA_DeadSoon"name="HVAA_SP2"style="width:24px;"placeholder="50"type="text">%</span></div><div title="默认【空格】暂停，【回车】选择模式"><b>快捷键</b>：按<input name="HVAA_Shortcut_Pause"style="width:60px;"type="text"placeholder=" "onkeyup="this.value=event.key;">暂停，按<input name="HVAA_Shortcut_Choose"style="width:60px;"type="text"placeholder="Enter"onkeyup="this.value=event.key;">选择模式</div><div><input type="checkbox"id="HVAA_CrazyMode"><label for="HVAA_CrazyMode"><b>浴血模式</b>：即使<span style="color:red;font-weight:bold;">血量过低</span>，仍然继续打怪。</label></div><div title="防止脚本莫名暂停"><input id="HVAA_Delay_Alert"type="checkbox"><label for="HVAA_Delay_Alert">页面停留<input name="HVAA_Delay_Alert_Time"placeholder="10"style="width:24px;"type="text">秒后，警报；</label><input id="HVAA_Delay_Reload"type="checkbox"checked="true"><label for="HVAA_Delay_Reload">页面停留<input name="HVAA_Delay_Reload_Time"placeholder="15"style="width:24px;"type="text">秒后，刷新页面。</label></div><div title="感谢网友【zsp40088】提出，推荐安装版本【Vanilla Reloader 1.1.1】"><input id="HVAA_Reloader"type="checkbox"><label for="HVAA_Reloader">兼容Reloader脚本：每隔<input name="HVAA_Reloader_Time"placeholder="1"style="width:24px;"type="text">秒运行自动打怪主程序。</label></div><div title="延时攻击，防止内存使用过高，然并卵"><b>延时攻击</b>：延时<input name="HVAA_Attack_Delay_Time"style="width:24px;"placeholder="0.1"type="text">秒攻击。<br><input type="checkbox"id="HVAA_Attack_Delay2"><label for="HVAA_Attack_Delay2"><b>延时攻击2</b>：每隔<input name="HVAA_Attack_Delay2_Round"style="width:24px;"placeholder="10"type="text">回合，延迟<input name="HVAA_Attack_Delay2_Time"style="width:24px;"placeholder="10"type="text">秒攻击。</label></div><div id="HVAA_Su_Skill"style="display:none;"title="在战斗第一回合，满足以下条件，将自动使用\n1.总回合数大于等于12\n2.战斗类型为：浴血擂台\n3.遭遇战中，敌方有6只以上怪物"><b>增益技能</b>：<input type="checkbox"id="HVAA_Su_Skill_HD"class="HVAA_Su_Skill"><label for="HVAA_Su_Skill_HD">Health Draught</label><input type="checkbox"id="HVAA_Su_Skill_MD"class="HVAA_Su_Skill"><label for="HVAA_Su_Skill_MD">Mana Draught</label><input type="checkbox"id="HVAA_Su_Skill_SD"class="HVAA_Su_Skill"><label for="HVAA_Su_Skill_SD">Spirit Draught</label><input type="checkbox"id="HVAA_Su_Skill_Pr"class="HVAA_Su_Skill"><label for="HVAA_Su_Skill_Pr">Protection</label><input type="checkbox"id="HVAA_Su_Skill_Ha"class="HVAA_Su_Skill"><label for="HVAA_Su_Skill_Ha">Haste</label><input type="checkbox"id="HVAA_Su_Skill_SL"class="HVAA_Su_Skill"><label for="HVAA_Su_Skill_SL">Spark of Life</label><input type="checkbox"id="HVAA_Su_Skill_SS"class="HVAA_Su_Skill"><label for="HVAA_Su_Skill_SS">Spirit Shield</label></div><div id="HVAA_Channel_Skill"style="display:none;"title="当获得Channel这个Buff时，\n将先重新使用将要消失的技能，\n之后才会使用一下技能。\n需要满足的条件与【增益技能】相同"><b>Channel技能</b>：<input type="checkbox"id="HVAA_Channel_Skill_AF"class="HVAA_Channel_Skill"><label for="HVAA_Channel_Skill_AF">Arcane Focus</label><input type="checkbox"id="HVAA_Channel_Skill_He"class="HVAA_Channel_Skill"><label for="HVAA_Channel_Skill_He">Heartseeker</label><input type="checkbox"id="HVAA_Channel_Skill_Re"class="HVAA_Channel_Skill"><label for="HVAA_Channel_Skill_Re">Regen</label><input type="checkbox"id="HVAA_Channel_Skill_SV"class="HVAA_Channel_Skill"><label for="HVAA_Channel_Skill_SV">Shadow Veil</label><input type="checkbox"id="HVAA_Channel_Skill_Ab"class="HVAA_Channel_Skill"><label for="HVAA_Channel_Skill_Ab">Absorb</label></div><div id="HVAA_De_Skill"style="display:none;"><b>De技能</b>：<input type="checkbox"id="HVAA_Channel_Skill_Im"class="HVAA_Channel_Skill"><label for="HVAA_Channel_Skill_Im">Imperil</label></div><div id="HVAA_Attack_Status"style="color:red;"><b>攻击模式</b>：<input type="radio"id="HVAA_Attack_Status_0"name="HVAA_Attack_Status"value="0"><label for="HVAA_Attack_Status_0">物理</label><input type="radio"id="HVAA_Attack_Status_1"name="HVAA_Attack_Status"value="1"><label for="HVAA_Attack_Status_1">火</label><input type="radio"id="HVAA_Attack_Status_2"name="HVAA_Attack_Status"value="2"><label for="HVAA_Attack_Status_2">冰</label><input type="radio"id="HVAA_Attack_Status_3"name="HVAA_Attack_Status"value="3"><label for="HVAA_Attack_Status_3">雷</label><input type="radio"id="HVAA_Attack_Status_4"name="HVAA_Attack_Status"value="4"><label for="HVAA_Attack_Status_4">风</label><input type="radio"id="HVAA_Attack_Status_5"name="HVAA_Attack_Status"value="5"><label for="HVAA_Attack_Status_5">圣</label><input type="radio"id="HVAA_Attack_Status_6"name="HVAA_Attack_Status"value="6"><label for="HVAA_Attack_Status_6">暗</label></div><div id="HVAA_Alert"><h2 style="text-align:center;">警报</h2>【默认】：<input class="HVAA_Alert"name="HVAA_Alert_default"style="width:400px;"type="text"><a href="javascript:#"onclick="var audio = new Audio(this.previousElementSibling.value||this.previousElementSibling.placeholder);audio.play();">试听</a><br/>【答题】：<input class="HVAA_Alert"name="HVAA_Alert_Riddle"style="width:400px;"type="text"><a href="javascript:#"onclick="var audio = new Audio(this.previousElementSibling.value||this.previousElementSibling.placeholder);audio.play();">试听</a><br/>【胜利】：<input class="HVAA_Alert"name="HVAA_Alert_Win"style="width:400px;"type="text"><a href="javascript:#"onclick="var audio = new Audio(this.previousElementSibling.value||this.previousElementSibling.placeholder);audio.play();">试听</a><br/>【错误】：<input class="HVAA_Alert"name="HVAA_Alert_Error"style="width:400px;"type="text"><a href="javascript:#"onclick="var audio = new Audio(this.previousElementSibling.value||this.previousElementSibling.placeholder);audio.play();">试听</a><br/>【失败】：<input class="HVAA_Alert"name="HVAA_Alert_Failed"style="width:400px;"type="text"><a href="javascript:#"onclick="var audio = new Audio(this.previousElementSibling.value||this.previousElementSibling.placeholder);audio.play();">试听</a></div><div style="text-align:center;"><button id="HVAA_Setting_Apply">确认</button><button onclick="document.querySelector(\'#HV_AutoAttack_Option\').style.display=\'none\';">取消</button></div>';
  var Input_Alert = HV_AutoAttack_Option.querySelectorAll('.HVAA_Alert');
  var File_Type = (/Chrome|Safari/.test(window.navigator.userAgent)) ? '.mp3' : '.wav';
  for (var i = 0; i < Input_Alert.length; i++) {
    Input_Alert[i].placeholder = 'https://github.com/dodying/UserJs/raw/master/HV_AutoAttack/' + Input_Alert[i].name.replace('HVAA_Alert_', '') + File_Type;
  }
  if (localStorage.HVAA_Setting) {
    var HVAA_Setting = JSON.parse(localStorage.HVAA_Setting);
    //console.log(HVAA_Setting);
    var input = HV_AutoAttack_Option.querySelectorAll('input');
    for (var i = 0; i < input.length; i++) {
      if (input[i].parentNode.style.display === 'none') continue;
      if (input[i].type === 'text') {
        input[i].value = HVAA_Setting[input[i].name.replace('HVAA_', '')];
      } else if (input[i].type === 'checkbox') {
        input[i].checked = HVAA_Setting[input[i].id.replace('HVAA_', '')];
      } else if (input[i].type === 'radio') {
        (HVAA_Setting[input[i].name.replace('HVAA_', '')] === input[i].value) ? input[i].checked = true : input[i].checked = false;
      }
    }
  }
  HV_AutoAttack_Option.querySelector('#HVAA_Setting_Apply').onclick = function () {
    var Option = this.parentNode.parentNode;
    if (!Option.querySelector('input[name="HVAA_Attack_Status"]:checked')) {
      alert('请选择攻击模式');
      Option.querySelector('#HVAA_Attack_Status').style.fontSize = 'larger';
      setTimeout(function () {
        Option.querySelector('#HVAA_Attack_Status').style.fontSize = '';
      }, 500);
      return;
    }
    var Input_Alert = Option.querySelectorAll('.HVAA_Alert');
    for (var i = 0; i < Input_Alert.length; i++) {
      if (Input_Alert[i].value !== '' && Input_Alert[i].value.substring(Input_Alert[i].value.length - 4) !== File_Type) {
        alert('请替换并试听第' + eval(i + 1) + '个音频。');
        return;
      }
    }
    var HVAA_Setting = {
    };
    HVAA_Setting.version = GM_info.script.version;
    var input = Option.querySelectorAll('input');
    for (var i = 0; i < input.length; i++) {
      if (input[i].parentNode.style.display === 'none') continue;
      if (input[i].type === 'text') {
        HVAA_Setting[input[i].name.replace('HVAA_', '')] = input[i].value || input[i].placeholder;
      } else if (input[i].type === 'checkbox') {
        HVAA_Setting[input[i].id.replace('HVAA_', '')] = input[i].checked;
      } else if (input[i].type === 'radio' && input[i].checked) {
        HVAA_Setting[input[i].name.replace('HVAA_', '')] = input[i].value;
      }
    }
    console.log(HVAA_Setting);
    localStorage.HVAA_Setting = JSON.stringify(HVAA_Setting);
    Option.style.display = 'none';
  };
  document.body.appendChild(HV_AutoAttack_Option);
} //////////////////////////////////////////////////

function HotKey() { //设置全局快捷键
  window.onkeydown = function (e) {
    if (e.key === HVAA_Setting.Shortcut_Pause) {
      if (!localStorage.HVAA_disabled) {
        localStorage.HVAA_disabled = true;
      } else {
        removeItemInStorage();
      }
      window.location = window.location.href;
    } else if (e.key === HVAA_Setting.Shortcut_Choose) {
      var p = parseInt(prompt('请选择（默认为火）：\n0.物理\n1.火\n2.冰\n3.雷\n4.风\n5.圣\n6.暗', ''));
      if (isNaN(p)) {
        return;
      }
      localStorage.HVAA_Attack_Status = p;
      window.location = window.location.href;
    }
  };
} //////////////////////////////////////////////////

function RiddleAlert() { //答题警报
  if (document.querySelector('#riddlemaster')) {
    document.title = '！！！紧急';
    var audio = document.createElement('audio');
    audio.src = HVAA_Setting.Alert_Riddle;
    audio.play();
    var random = Math.random();
    if (random < 1 / 3) {
      document.querySelector('#riddlemaster').value = 'A';
    } else if (random < 2 / 3) {
      document.querySelector('#riddlemaster').value = 'B';
    } else {
      document.querySelector('#riddlemaster').value = 'C';
    }
  }
} //////////////////////////////////////////////////

function OtherAlert(e) { //其他警报
  var audio = document.createElement('audio');
  switch (e) {
    default:
      audio.src = HVAA_Setting.Alert_default;
      break;
    case 'Win':
      audio.src = HVAA_Setting.Alert_Win;
      break;
    case 'Error':
      audio.src = HVAA_Setting.Alert_Error;
      break;
    case 'Failed':
      audio.src = HVAA_Setting.Alert_Failed;
      break;
  }
  audio.play();
} //////////////////////////////////////////////////

function CountRound() { //回合计数及自动前进并获取怪物Hp
  var RoundType;
  if (!localStorage.HVAA_Round_Type) {
    RoundType = window.location.search.toString().replace('?', '').replace('s=Battle', '').replace('ss=', '').replace('page=2', '').replace(/filter=(.*)/, '').replace(/encounter=(.*)/, 'encounter').replace(/&/g, '').replace('ba', '');
    localStorage.HVAA_Round_Type = RoundType;
  } else {
    RoundType = localStorage.HVAA_Round_Type;
  }
  var BattleLog = document.querySelectorAll('#togpane_log>table>tbody>tr>td.t3');
  if (BattleLog.length === Monster_Count_All + 2 && BattleLog[BattleLog.length - 1].innerHTML === 'Battle Start!') {
    removeItemInStorage(1);
  }
  if (!localStorage.HVAA_Round_Now) {
    var Monster = [
    ];
    var id = 0;
    for (var i = BattleLog.length - 3; i > BattleLog.length - 3 - Monster_Count_All; i--) {
      var temp = {
      };
      var hp = parseFloat(BattleLog[i].innerHTML.replace(/.*HP=/, ''));
      temp.id = id;
      temp.isDead = false;
      temp.isBoss = (document.querySelectorAll('div.btm2') [id].style.background === '') ? false : true;
      if (!isNaN(hp)) {
        temp.Hp = hp;
      } else {
        temp.Hp(Monster[Monster.length - 1].hp);
      }
      Monster[id] = temp;
      id++;
    }
    localStorage.HVAA_Monster = JSON.stringify(Monster);
    if (RoundType === 'encounter') {
      if (Monster_Count_All > 5 || Monster_Count_Boss_Alive > 0) {
        Round_Now = 1;
        localStorage.HVAA_Round_Now = Round_Now;
        Round_All = 1;
        localStorage.HVAA_Round_All = Round_All;
        //document.getElementById('1001').click();
      } else {
        Round_Now = 2;
        localStorage.HVAA_Round_Now = Round_Now;
        Round_All = 2;
        localStorage.HVAA_Round_All = Round_All;
      }
    } else {
      var Round = BattleLog[BattleLog.length - 2].innerHTML.replace(/.*\(Round /, '').replace(/\).*/, '').replace(/\s+/g, '');
      Round_Now = Number(Round.replace(/\/.*/, ''));
      localStorage.HVAA_Round_Now = Round_Now;
      Round_All = Number(Round.replace(/.*\//, ''));
      localStorage.HVAA_Round_All = Round_All;
    }
  } else {
    Round_Now = Number(localStorage.HVAA_Round_Now);
    Round_All = Number(localStorage.HVAA_Round_All);
  }
  if (Monster_Count_Alive > 0 && document.querySelector('.btcp')) {
    OtherAlert('Failed');
    removeItemInStorage(2);
  } else if (Round_Now !== Round_All && document.querySelector('.btcp')) {
    removeItemInStorage(1);
    document.getElementById('ckey_continue').click();
  } else if (Round_Now === Round_All && document.querySelector('.btcp')) {
    OtherAlert('Win');
    removeItemInStorage(2);
    setTimeout(function () {
      window.location = 'http://hentaiverse.org/';
    }, 3000);
  } else if (Round_Now === Round_All) {
    document.getElementById('infopane').style.backgroundColor = 'gray';
  }
} //////////////////////////////////////////////////

function AutoUseGem() { //自动使用宝石
  if (document.getElementById('ikey_p')) {
    var Gem = document.getElementById('ikey_p').getAttribute('onmouseover').replace(/battle.set_infopane_item\(\'(.*?)\'.*/, '$1');
    if (Gem === 'Health Gem' && HP <= HVAA_Setting.HP1 * 0.01) {
      document.getElementById('ikey_p').click();
    } else if (Gem === 'Mana Gem' && MP <= HVAA_Setting.MP1 * 0.01) {
      document.getElementById('ikey_p').click();
    } else if (Gem === 'Spirit Gem' && SP <= HVAA_Setting.SP1 * 0.01) {
      document.getElementById('ikey_p').click();
    } else if (Gem === 'Mystic Gem') {
      document.getElementById('ikey_p').click();
    }
  }
} //////////////////////////////////////////////////

function DeadSoon() { //自动回血回魔
  if (MP < HVAA_Setting.MP2 * 0.01) { //自动回魔
    document.getElementById('quickbar').style.backgroundColor = 'blue';
    if (document.querySelector('#ikey_5')) {
      document.querySelector('.bti3>div[onmouseover*="Mana Potion"]').click();
    }
  }
  if (MP <= 0.05 && !document.querySelector('.bti3>div[onmouseover*="Mana Potion"]')) {
    document.querySelector('.bti3>div[onmouseover*="Mana Elixir"]').click();
  }
  if (SP < HVAA_Setting.SP2 * 0.01) { //自动回精
    document.getElementById('quickbar').style.backgroundColor = 'green';
    if (document.querySelector('.bti3>div[onmouseover*="Spirit Potion"]')) {
      document.querySelector('.bti3>div[onmouseover*="Spirit Potion"]').click();
    }
  }
  if (SP <= 0.05 && !document.querySelector('.bti3>div[onmouseover*="Spirit Potion"]')) {
    document.querySelector('.bti3>div[onmouseover*="Spirit Elixir"]').click();
  }
  if (HP <= HVAA_Setting.HP1 * 0.01) { //自动回血
    document.getElementById('311').click();
    if (!document.querySelector('.cwb2[src*="/s/barsilver.png"]')) {
      document.getElementById('quickbar').style.backgroundColor = 'red';
      if (document.getElementById('311').style.opacity === '0.5') {
        document.getElementById('313').click();
        if (document.getElementById('313').style.opacity === '0.5') {
          if (document.querySelector('.bti3>div[onmouseover*="Health Potion"]')) {
            document.querySelector('.bti3>div[onmouseover*="Health Potion"]').click(); //这里出错
          } else if (oc > 0) {
            document.getElementById('ckey_defend').click();
          }
        }
        document.getElementById('313').click();
      }
    }
  }
  if (HP <= 0.05 && !document.querySelector('.bti3>div[onmouseover*="Health Potion"]')) {
    document.querySelector('.bti3>div[onmouseover*="Health Elixir"]').click();
  }
} //////////////////////////////////////////////////

function AutoUsePotAndSuSkill() { //自动使用药水、增益技能
  if ((Round_All >= 12) || (Round_All === Round_Now && Round_All === 1)) {
    if (document.querySelector('div.bte>img[src*="/e/channeling.png"]')) {
      var buff = document.querySelector('div.bte').querySelectorAll('img');
      if (buff.length > 1) {
        for (var n = 0; n < buff.length; n++) {
          var spell_name = buff[n].getAttribute('onmouseover').replace(/battle.set_infopane_effect\(\'(.*?)\'.*/, '$1');
          if (spell_name === 'Absorbing Ward') continue;
          var buff_lasttime = Number(buff[n].getAttribute('onmouseover').replace(/.*\'\,(.*?)\)/g, '$1'));
          if (buff_lasttime <= 15) {
            if (spell_name === 'Cloak of the Fallen' && !document.querySelector('div.bte>img[src*="/e/sparklife.png"]')) {
              document.getElementById('422').click();
            } else if (spell_name === 'Spark of Life') {
              document.getElementById('422').click();
            } else if (spell_name === 'Spirit Shield') {
              document.getElementById('423').click();
            } else if (spell_name === 'Hastened') {
              document.getElementById('412').click();
            } else if (spell_name === 'Protection') {
              document.getElementById('411').click();
            } else if (spell_name === 'Arcane Focus') {
              document.getElementById('432').click();
            } else if (spell_name === 'Regen') {
              document.getElementById('312').click();
            }
          }
        }
      }
      if (!document.querySelector('div.bte>img[src*="/e/arcanemeditation.png"]')) {
        document.getElementById('432').click();
      } else if (!document.querySelector('div.bte>img[src*="/e/regen.png"]')) {
        document.getElementById('312').click();
      } else if (!document.querySelector('div.bte>img[src*="/e/shadowveil.png"]')) {
        document.getElementById('413').click();
      } else if (!document.querySelector('div.bte>img[src*="/e/absorb.png"]')) {
        document.getElementById('421').click();
      }
    }
    if (!document.querySelector('div.bte>img[src*="/e/healthpot.png"]') && HP < 1) {
      document.querySelector('.bti3>div[onmouseover*="Health Draught"]').click();
    } else if (!document.querySelector('div.bte>img[src*="/e/manapot.png"]') && MP < 1) {
      document.querySelector('.bti3>div[onmouseover*="Mana Draught"]').click();
    } else if (!document.querySelector('div.bte>img[src*="/e/spiritpot.png"]') && SP < 0.8) {
      document.querySelector('.bti3>div[onmouseover*="Spirit Draught"]').click();
    } else if (!document.querySelector('div.bte>img[src*="/e/protection.png"]')) {
      document.getElementById('411').click();
    } else if (!document.querySelector('div.bte>img[src*="/e/haste.png"]')) {
      document.getElementById('412').click();
    } else if (!document.querySelector('div.bte>img[src*="/e/sparklife.png"]')) {
      document.getElementById('422').click();
    } else if (!document.querySelector('div.bte>img[src*="/e/spiritshield.png"]')) {
      document.getElementById('423').click();
    }
  } else if (Round_All === Round_Now && Round_All === 2) {
    if (!document.querySelector('div.bte>img[src*="/e/sparklife.png"]')) {
      document.getElementById('422').click();
    }
  }
} //////////////////////////////////////////////////

function AutoUseDeSkill() {
  if (document.getElementById('213').style.opacity !== '0.5') { // && Round_Now >= 50
    document.getElementById('213').click();
    for (var i = 0; i < Monster_Count_All; i++) {
      if (Monster[i].isBoss) break;
    }
    i++;
    document.getElementById('mkey_' + random).click();
  }
} //////////////////////////////////////////////////

function AutoAttack() { //自动打怪
  if (HP < HVAA_Setting.HP2 * 0.01) {
    if (!HVAA_Setting.CrazyMode) {
      if (!confirm('HP小于' + HVAA_Setting.HP2 + '%，是否继续自动打怪？\r\n可能会死亡')) {
        //OtherAlert();
        return;
      }
    }
  }
  var MonsterHPNow = [
  ];
  var HPBar = document.querySelectorAll('div.btm4>div.btm5:nth-child(1)');
  for (var i = 0; i < HPBar.length; i++) {
    if (HPBar[i].querySelector('img[src="/y/s/nbardead.png"]')) {
      MonsterHPNow[i] = Infinity;
      if (!(Monster[i].isDead)) {
        Monster[i].isDead = true;
      }
    } else {
      MonsterHPNow[i] = Monster[i].Hp * parseFloat(HPBar[i].querySelector('div.chbd>img.chb2').style.width) / 120;
    }
  }
  console.log(MonsterHPNow);
  localStorage.HVAA_Monster = JSON.stringify(Monster);
  var HPMin = Math.min.apply(null, MonsterHPNow);
  var minnum;
  for (i = 0; i < MonsterHPNow.length; i++) {
    if (HPMin === MonsterHPNow[i]) {
      minnum = i + 1;
      break;
    }
  }
  var Attack_Status2Chinese = {
    0: '物理',
    1: '火',
    2: '冰',
    3: '雷',
    4: '风',
    5: '圣',
    6: '暗',
    '物理': 0,
    '火': 1,
    '冰': 2,
    '雷': 3,
    '风': 4,
    '圣': 5,
    '暗': 6
  };
  var Attack_Status_title = Attack_Status2Chinese[Attack_Status];
  document.querySelector('#infopane>.btii').innerHTML = '回合：' + Round_Now + '/' + Round_All + '<br>攻击模式：' + Attack_Status_title + '<br>存活Boss：' + Monster_Count_Boss_Alive + '<br>怪物：' + Monster_Count_Alive + '/' + Monster_Count_All;
  document.querySelector('#infopane>.btii').style = 'font-size:20px;text-align:center;';
  document.querySelector('#infopane').style.height = 'auto';
  document.title = Round_Now + '/' + Round_All + Attack_Status_title + ' ' + Monster_Count_Boss_Alive + ' ' + Monster_Count_Alive + '/' + Monster_Count_All;
  if (Monster_Count_Alive <= Monster_Count_Boss_Alive && Monster_Count_Alive > 0) {
    var MonsterDiv = document.querySelector('#mkey_' + minnum + '>.btm3>.fd2>div');
    var MonsterName = MonsterDiv.innerHTML;
    var Boss_Weakness = { //Boss的弱点库
      'Dalek': '弱点-雷',
      'Manbearpig': '弱点-火',
      'White Bunneh': '弱点-冰',
      'Mithra': '弱点-圣',
      'Konata': '弱点-风',
      'Mikuru Asahina': '弱点-暗|圣',
      'Yuki Nagato': '弱点-暗|圣',
      'Real Life': '弱点-物理',
      'Ryouko Asakura': '弱点-圣|暗',
      'Invisible Pink Unicorn': '弱点-暗',
      'Yggdrasil': '弱点-火',
      'Urd': '弱点-冰',
      'Verdandi': '弱点-风',
      'Skuld': '弱点-雷',
      'Flying Spaghetti Monster': '弱点-圣'
    };
    if (MonsterName in Boss_Weakness) {
      MonsterDiv.innerHTML = Boss_Weakness[MonsterName];
      MonsterName = MonsterDiv.innerHTML;
      MonsterName = MonsterName.replace('弱点-', '').replace(/\|.*/, '');
      if (MonsterName in Attack_Status2Chinese) {
        Attack_Status = Attack_Status2Chinese[MonsterName];
      }
    } else {
      OtherAlert('Error');
      alert('待定');
      return;
    }
  }
  if (Attack_Status !== 0) {
    if (document.getElementById('1' + Attack_Status + '1')) {
      document.getElementById('1' + Attack_Status + '1').click();
    }
    if (Monster_Count_All >= 8 && Monster_Count_Dead <= 1) {
      if (document.getElementById('1' + Attack_Status + '2')) {
        document.getElementById('1' + Attack_Status + '2').click();
      }
      if (document.getElementById('1' + Attack_Status + '3')) {
        document.getElementById('1' + Attack_Status + '3').click();
      }
    }
  }
  if (document.getElementById('2501').style.opacity === '0.5' && oc >= 0.2) {
    document.getElementById('2501').click();
  }
  if (minnum === 10) {
    minnum = 0;
  }
  if (HVAA_Setting.Attack_Delay2 && Round_Now % HVAA_Setting.Attack_Delay2_Round === 0 && Monster_Count_Alive === Monster_Count_All && Monster_Count_Alive > Monster_Count_Boss_Alive && Round_Now > HVAA_Setting.Attack_Delay2_Round) {
    i = 0;
    var time = HVAA_Setting.Attack_Delay2_Time;
    var title = document.title;
    for (var j = 0; j < time; j++) {
      setTimeout(function () {
        var countdown = time - i;
        document.title = '[' + countdown + '秒后继续运行]' + title;
        i++;
      }, 1000 * j);
    }
    setTimeout(function () {
      document.getElementById('mkey_' + minnum).click();
    }, 1000 * time);
  } else {
    setTimeout(function () {
      document.getElementById('mkey_' + minnum).click();
    }, HVAA_Setting.Attack_Delay_Time * 1000);
  }
}
