import chalk from 'chalk'
const colors = {
    success: { color: 'green' },
    warning: { color: 'yellow' },
    error: { color: 'red' },
  };
// 截取数字的最后7位数
export function handleId(id) {
    // 不足7位全部返回
    if (id.toString().length <= 7) {
        return id
    }
    return Number(id.toString().slice(-7))
}
export function log(type, message) {
    const color = colors[type]?.color || 'white';
    console.log(chalk[color](message));
  }