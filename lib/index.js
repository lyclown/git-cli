#!/usr/bin/env node

import GitTools from './gitTool.js'
import {promptType} from './inquirerTools.js'
import {Command} from 'commander'
const program = new Command()
const git = new GitTools()
program
  .name('git-cli')
  .description('一个git自动化命令')
  .version('0.0.1');


const validatorType = (type)=>{
	if(!git[type]){
		throw new Error('参数不正确')
	}
	return type
	
}
const filterInput = ['add','status','branch'];
program.option('-t --type <type>','请选择你要进行的操作',validatorType)
.option('-b --branch [branch]','请输入一个分支名')
.option('-c --commit [commit]','请输入备注信息')
.option('-sb --serveBranch [serveBranch]','请输入远程分支名')
.action(async ({type,branch,commit,serveBranch})=>{
	if(!type){
		type = (await promptType('type')).type
	}
    const data = await git[type]({branch,commit,serveBranch})
    console.log('操作成功',data)
})
program.parse();  