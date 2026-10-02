const gestures=[
["✊","FIST","Closed hand / 0 detected fingers"],
["☝️","ONE","One detected finger"],
["✌️","TWO","Two detected fingers"],
["🤟","THREE","Three detected fingers"],
["🖐️","FOUR","Four detected fingers"],
["✋","HELLO","Five detected fingers"]
];
document.querySelector("#dictionaryGrid").innerHTML=gestures.map(([icon,title,desc])=>`<article class="gesture-card glass"><div class="gesture-icon">${icon}</div><h3>${title}</h3><p>${desc}</p></article>`).join("");
