const customAlert = () => alert('не надо тыкать, это макет)')
const btns = document.querySelectorAll('button')
btns.forEach(btn => btn.addEventListener('click', customAlert))