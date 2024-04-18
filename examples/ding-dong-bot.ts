#!/usr/bin/env -S node --no-warnings --loader ts-node/esm
/**
 * Wechaty - Conversational RPA SDK for Chatbot Makers.
 *  - https://github.com/wechaty/wechaty
 */
// https://stackoverflow.com/a/42817956/1123955
// https://github.com/motdotla/dotenv/issues/89#issuecomment-587753552
import 'dotenv/config.js'

import {
  Contact,
  Message,
  ScanStatus,
  WechatyBuilder,
  log,
}                  from 'wechaty'

import qrcodeTerminal from 'qrcode-terminal'

function onScan (qrcode: string, status: ScanStatus) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    const qrcodeImageUrl = [
      'https://wechaty.js.org/qrcode/',
      encodeURIComponent(qrcode),
    ].join('')
    log.info('StarterBot', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)

    qrcodeTerminal.generate(qrcode, { small: true })  // show qrcode on console

  } else {
    log.info('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status)
  }
}

function onLogin (user: Contact) {
  log.info('StarterBot', '%s login', user)
}

function onLogout (user: Contact) {
  log.info('StarterBot', '%s logout', user)
}
// 提取消息中的第一个链接
function extractFirstLink(txt: string) {
  const urlRegex = /(https?:\/\/[^?]+)/; // 匹配第一个链接直到问号为止
  const match = txt.match(urlRegex); // 匹配第一个链接
  return match ? match[0] : ''; // 如果匹配到链接，则返回链接，否则返回空字符串
}

async function onMessage(msg: Message) {
  log.info('StarterBot', msg.toString())

  // 判断收到的消息是否是来自自己，如果是，则不进行处理
  if (msg.self()) {
    return;
  }
  if (msg.text() === 'ding') {
    await msg.say('dong')
  }

  const txt = msg.text(); // 获取消息文本
  const link = extractFirstLink(txt); // 提取第一个链接
  console.log(link);

  // 如果消息中包含链接，则回复消息中的链接
  if (link) {
    await msg.say(link); // 回复消息中的第一个链接
  }
}

const bot = WechatyBuilder.build({
  name: 'ding-dong-bot',
  //  * You can specific `puppet` and `puppetOptions` here with hard coding:
  //  *
  puppet: 'wechaty-puppet-wechat',
  puppetOptions: {
    uos: true,
  }
})

bot.on('scan',    onScan)
bot.on('login',   onLogin)
bot.on('logout',  onLogout)
bot.on('message', onMessage)

bot.on('friendship', async friendship => {
  try {
    switch (friendship.type()) {
      // 1：收到了对方发来的好友请求。
      case 1:
        await friendship.accept()
        break
      // 2：通过扫描二维码的方式添加好友。
      case 2:
        await friendship.accept()
        break
    }
  } catch (e) {
    console.error(e)
  }
})

bot.start()
  .then(() => log.info('StarterBot', 'Starter Bot Started.'))
  .catch(e => log.error('StarterBot', e))
