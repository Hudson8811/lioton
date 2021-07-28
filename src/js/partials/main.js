$(document).ready(function() {
	$('a.anchor').click(function(e) {
		e.preventDefault();
		$('html, body').animate({ scrollTop: $($(this).attr('href')).offset().top }, 500);
	});

	carousel = new Swiper('.__js_carousel', {
		slidesPerView: 1,
		speed: 300,
		spaceBetween: 34,
		pagination: {
			el: '.lifehack__pagination',
			clickable: true,
			renderBullet: function (index, className) {
				return '<button class="lifehack__bullet ' + className + '"><span></span></button>';
			}
		},
		navigation: {
			prevEl: '.slider-prev',
			nextEl: '.slider-next'
		}
	});

	carousel.on('slideChange', function () {
		$('.lifehack__fraction .current').text(carousel.realIndex + 1);
	});

	setEqualHeight($('.lifehack__slide'));

	function setEqualHeight(el) {
		var tallestcolumn = 0;

		el.each(function() {
			var currentHeight = $(this).height();

			if (currentHeight > tallestcolumn) {
				tallestcolumn = currentHeight;
			}
		});

		el.height(tallestcolumn);
	}

	/* Квиз */
	curQuestion = 0;
	countQuestion = 1;
	points = 0;

	$.getJSON('quiz.json', function (data) {
		allQuestions = data;
		//mixArray(allQuestions.test);
		countQuestion = allQuestions.test.length;
		curQuestion++;
		setQuestion(curQuestion, allQuestions);

		// Добавить булиты по количеству слайдов
		for (var i = 0; i < allQuestions.test.length - 1; i++) {
			$('.quiz__dots p:first-child').clone(true).appendTo('.quiz__dots');
		}

		$('.quiz__dots p:first-child').addClass('active');
	});

	/* Кнопки выбора */
	$('.quiz__block--question .quiz__choice').click(function () {
		var choise = $(this).attr('data-correct');

		if (allQuestions.test[curQuestion-1].correct === choise) {
			points++;
			$('.quiz__choice--correct').show();
			$('.quiz__choice--incorrect').hide();
		} else {
			$('.quiz__choice--correct').hide();
			$('.quiz__choice--incorrect').show();
		}

		/* Цвет круглых паттернов в ответе */
		if (allQuestions.test[curQuestion-1].correct === 'false') {
			$('.circle-small, .circle-big').css('fill', '#E5539B');
		} else {
			$('.circle-small, .circle-big').css('fill', '#77ACD8');
		}

		$('.quiz__block--question').hide();
		$('.quiz__block--answer').css('display', 'flex');
	});

	/* Кнопка следующего вопроса (результата) */
	$('.quiz__block--answer .quiz__next').click(function () {
		if (curQuestion < countQuestion) {
			curQuestion++;
			setQuestion(curQuestion, allQuestions);
		} else {
			showResults(points);
		}
	});

	function setQuestion(curQuestion, allQuestions) {
		var quest = allQuestions.test[curQuestion - 1],
			questionNum = curQuestion,
			questionNum2 = $('.quiz__question-num-outer .current'),
			img = quest.img,
			question = quest.question,
			answer = quest.answer,
			num = answer.num,
			title = answer.title,
			subtitle = answer.subtitle,
			text = answer.text,
			pagi = $('.quiz__pagi');

		questionNum2.text(questionNum.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}));

		/* Пагинация */
		// Счетчик
		pagi.find('.current').html(questionNum);
		// Смена активного булита
		$('.quiz__dots p.active').removeClass('active').next().addClass('active');


		$('.quiz__qiestion-num .quest-digit').html(questionNum);
		$('.quiz__image img').attr('src', img);
		$('.quiz__qiestion').html(question);
		$('.quiz__step .current').html(num);
		$('.quiz__answer').html(title);
		$('.quiz__answer-subtitle').html(subtitle);
		$('.quiz__answer-text').html(text);

		$('.quiz__block--question').css('display', 'flex');
		$('.quiz__block--answer').hide();
	}

	function mixArray(arr) {
		var curIndex = arr.length, temp, randIndex;

		while (0 !== curIndex) {
			randIndex = Math.floor(Math.random() * curIndex);
			curIndex -= 1;
			temp = arr[curIndex];
			arr[curIndex] = arr[randIndex];
			arr[randIndex] = temp;
		}

		return arr;
	}

	function showResults(result1) {
		$.getJSON('result.json', function (data) {
			var result = data;

			if (result1 > 4) {
				$('.quiz__result-text').html(result.result[0].text);
			} else {
				$('.quiz__result-text').html(result.result[1].text);
			}

			$('.quiz__result-points .your-point').text(points);
			$('.quiz__block--result').css('display', 'flex');
			$('.quiz__block--answer').hide();
		})
	}

});