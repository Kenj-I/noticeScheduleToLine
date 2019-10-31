function sendTodaySchedule() {
  var accessToken = PropertiesService.getScriptProperties().getProperty('LINE_TOKEN');

  var message = generateMessage(0);
  var options =
   {
     'method'  : 'post',
     'payload' : 'message=' + encodeURIComponent(message), // &とかの記号で途切れるためエンコードする
     'headers' : {'Authorization' : 'Bearer '+ accessToken}
    ,muteHttpExceptions:true
   };
  UrlFetchApp.fetch('https://notify-api.line.me/api/notify',options);
}


// LINEに送るメッセージを生成
function generateMessage(prm) {
  const dow = ['日','月','火','水','木','金','土'];
  var cal = CalendarApp.getCalendarById('kenji.iwase.5@gmail.com');
  var date = new Date();
  var strBody = '';
  var strHeader = '';
  // タイトル
  if ( prm==0 ) {
    strHeader = '\n今日 ';
  } else if ( prm==1 ) {
    strHeader = '\n明日 ';
  } 
  date = new Date(date.getYear(),date.getMonth(),date.getDate() + prm);
  strHeader += Utilities.formatDate(date,'JST','yyyy/M/d') + '(' + dow[date.getDay()] + ') の予定\n\n';
  // 内容
  strBody = getEvents(cal,date);
  if ( _isNull(strBody) ) strBody = '\n予定はありません。';
  return strHeader + strBody;
}

// イベント取得 
function getEvents(prmCal,prmDate) {
  var strEvents = '';
  var strStart = '';
  var strEnd = '';
  var strTime = '';
  var strLocation = '';
  var strDescription = '';
  if ( !_isNull(prmCal) ) {
     var arrEvents = prmCal.getEventsForDay(new Date(prmDate));
    
     for (var i=0; i<arrEvents.length; i++) {
       if ( !_isNull(strEvents) ) strEvents += '\n';
       strStartDay = _MMdd(arrEvents[i].getStartTime());
       strStartTime = _HHmm(arrEvents[i].getStartTime());
       strEndDay = _MMdd(arrEvents[i].getEndTime());
       strEndTime = _HHmm(arrEvents[i].getEndTime());
       
       if ( strStartTime === strEndTime ) {
         strStartTime = '終日';
       } else if ( strStartDay != strEndDay ) {
         strTime =  strStartDay + ' ' + strStartTime + '～' + strEndDay + ' ' + strEndTime;
       } else {
         strTime = strStartTime + '～' + strEndTime;
       }
       strEvents += '･' + strTime + '【' + arrEvents[i].getTitle() + '】';
       strLocation = arrEvents[i].getLocation();
       strDescription = arrEvents[i].getDescription();
       if ( !_isNull(strLocation) ) strEvents += '\n　場所：' + strLocation;
       if ( !_isNull(strDescription) ) strEvents += '\n　説明：' + strDescription;
       strEvents += '\n';
     }
  }
  return strEvents;
}

// 時間をフォーマットで返す
function _HHmm(str){
  return Utilities.formatDate(str,'JST','HH:mm');
}

// 日時をフォーマットで返す
function _MMdd(str){
  return Utilities.formatDate(str, 'JST', 'MM/dd');
}

// null check
function _isNull(prm) {
  if ( prm=='' || prm===null || prm===undefined ) {
    return true;
  } else {
    return false;
  }
}
