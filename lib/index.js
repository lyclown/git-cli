#!/usr/bin/env node

import git from './../git/GitTool.js';
import { promptType } from '../utils/inquirerTools.js';
import { Command } from 'commander';
// import {version,description,name} from './../package.json'
import dotenv from 'dotenv';
dotenv.config();

const options = [
  { flags: '-t, --type <type>', desc: '请选择你要进行的操作', validator: (type) => {
    if (!git[type]) {
      throw new Error('参数不正确');
    }
    return type;
  }},
  { flags: '-b, --branch [branch]', desc: '请输入一个分支名' },
  { flags: '-c, --commit [commit]', desc: '请输入备注信息' },
  { flags: '-it, --iteration [iteration]', desc: '请输入迭代号，eg:"20230420"' },
  { flags: '-sb, --serveBranch [serveBranch]', desc: '请输入远程分支名' },
  { flags: '-pro, --projectKey [projectKey]', desc: '请输入项目名' },
  { flags: '-ru, --remoteUrl [remoteUrl]',desc:'请输入远程仓库地址'}
];

const program = new Command()
  .name('git-cli')
  .description('description')
  .version('0.0.1');

options.forEach(({ flags, desc, validator }) => {
  program.option(flags, desc, validator);
});

program.action(async ({ type, branch, commit, serveBranch, id, dec,projectKey,iteration,remoteUrl }) => {
  if (!type) {
    type = (await promptType('type')).type;
  }
  const data = await git[type]({ branch, commit, serveBranch, id, dec ,remoteUrl});
  console.log('操作成功', '完美!');
});
program.parse();
