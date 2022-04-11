// referenced https://sweetcode.io/how-to-build-an-faq-page-with-html-and-javascript/ to help create drop down menu

var faq = document.getElementsByClassName("question");
var i;

for (i = 0; i < question.length; i++) {
    question[i].addEventListener("click", function () {
        this.classList.toggle("active");

        var body = this.nextElementSibling;
        if (body.style.display === "block") {
            body.style.display = none;
        } else {
            body.style.display = "block";
        }
    });
}