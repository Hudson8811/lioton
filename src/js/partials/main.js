$(document).ready(function() {
	if (window.matchMedia('(min-width: 1080px)').matches) {
		new WOW().init();
	}

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



	/* Соцсети */
	window.auth = function (data) {
		$.ajax({
			type: "POST",
			url: "/authorize/",
			data: data,
			success: function(data) {
				if (data.length > 0) {
					checkAuth();
				}
			},
			error: function () {
				alert('Ошибка авторизации для продолжения');
			}
		});
	};

	function checkAuth() {
		$.ajax({
			type: "POST",
			url: "/get_hashcode/",
			success: function(data) {
				if (JSON.parse(data).hashcode != '' && JSON.parse(data).hashcode != undefined) {
					hash = JSON.parse(data).hashcode;

					$('.social').each(function () {
						var url = $(this).data('url');
						url += '&u='+encodeURIComponent(hash);
						$(this).attr('data-url', url);
					});
				}
			}
		});
	}

	var socialTypes =  {
		"fb": "http://www.facebook.com/share.php?u=",
		"vk": "http://vkontakte.ru/share.php?url=",
		"tw": "https://twitter.com/intent/tweet?url=",
		"ok": "http://connect.ok.ru/dk?st.cmd=WidgetSharePreview&service=odnoklassniki&st.shareUrl=",
	};

	function getMeta(name) {
		var meta = $('meta[property="og:'+name+'"]');
		return meta.length ? meta.attr('content') : '';
	}

	$('.socials__item').click(function() {
			var socialType;
			for (var name in socialTypes)
				if ($(this).hasClass(name)) { socialType = name; break; }
			if (socialType == undefined) return;

			var url = getMeta('url');
			var title = getMeta('title');
			var description = getMeta('description');
			var image = getMeta('image');

			var parent = $(this).closest('.social');
			var new_url = parent.attr('data-url');
			if (new_url) {
				url = new_url;
				image = '';
			}
			if (url == '') url = window.location.toString();

			var p_desc = parent.attr('data-description');
			if (p_desc) description = p_desc;
			var p_title = parent.attr('data-title');
			if (p_title) title = p_title;
			var p_image = parent.attr('data-image');
			if (p_image) image = p_image;

			var $slink = encodeURIComponent(url);
			switch (socialType) {
				case 'tw':
					$slink += '&text='+encodeURIComponent(title); break;
				case 'vk':
					if (image != '') $slink += '&image='+encodeURIComponent(image);
					if (title != '') $slink += '&title='+encodeURIComponent(title);
					if (description != '') $slink += '&description='+encodeURIComponent(description); break;
				case 'ok':
					if (image != '') $slink += '&st.imageUrl='+encodeURIComponent(image);
					if (description != '') $slink += '&st.comments='+encodeURIComponent(description); break;
				case 'fb':
					if (image != '') $slink += '&p[images][0]='+encodeURIComponent(image);
					if (title != '') $slink += '&p[title]='+encodeURIComponent(title);
					if (description != '') $slink += '&p[summary]='+encodeURIComponent(description); break;
			}

			if ($(this).data('mode') == 'nohash'){
				window.open(socialTypes[socialType]+$slink,socialType,'width=500,height=500,resizable=yes,scrollbars=yes,status=yes');
			} else {
				if (hash === '') checkAuth();
				window.open(socialTypes[socialType]+$slink,socialType,'width=500,height=500,resizable=yes,scrollbars=yes,status=yes');
				afterShare(socialType);
			}
		}
	);

	function afterShare(social) {
		$.ajax({
			type: "POST",
			url: "/new_share/",
			data: { social_share : social },
			success: function(data) {
				console.log('share ok');
			}
		});
	}



	/* Анимация присутствия свайпа на элементе */
	$(window).scroll(function () {
		checkScrollElem();
	});

	checkScrollElem();

	var blockVisible = false;

	function checkScrollElem() {
		if (blockVisible) {
			return false;
		}

		var windowTop = $(this).scrollTop(),
			windowHeight = $(this).height(),
			elemTop = $('.quiz__block').offset().top + 300,
			elemHeight = $('.quiz__block').outerHeight(),
			docHeight = $(document).height();

		if (windowTop + windowHeight >= elemTop || windowTop + windowHeight == docHeight || elemHeight + elemTop < windowHeight) {
			blockVisible = true;

			$('.quiz__content--quest').addClass('swipe');
		}
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

	/* Свайп */
	$('.quiz__content--quest').swipe({
		swipeStatus:function(event, phase, direction, distance, duration, fingers, fingerData) {
			let vector = 0;
			if (direction == 'left') vector = -1;
			if (direction == 'right') vector = 1;
			$(this).css('transform','translateX('+(vector*distance)+'px)');
			if(phase==$.fn.swipe.phases.PHASE_CANCEL) {
				$(this).removeAttr('style');
			}
		},
		swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
			if (distance > 1 && (direction == 'left' || direction == 'right')) {
				var position;

				if (direction == 'right'){
					position = 'false';
				} else if(direction == 'left') {
					position = 'true';

				}
				slideQuest(direction);

				let dBlock = 'block';
				if($(window).width() < 1080){
					dBlock = 'flex';
				}
				if (allQuestions.test[curQuestion-1].correct === position) {
					points++;
					$('.quiz__choice--correct').css('display', dBlock);
					$('.quiz__choice--incorrect').hide();
				} else {
					$('.quiz__choice--correct').hide();
					$('.quiz__choice--incorrect').css('display', dBlock);
				}

				if (allQuestions.test[curQuestion-1].correct !== position) {
					$('.circle-small, .circle-big').css('fill', '#E5539B');
				} else {
					$('.circle-small, .circle-big').css('fill', '#77ACD8');
				}

			}
		},
		threshold:100
	});

	$('.quiz__content--answer').swipe({
		swipeStatus:function(event, phase, direction, distance, duration, fingers, fingerData) {
			let vector = 0;
			if (direction == 'right') vector = 1;
			$(this).css('transform','translateX('+(vector*distance)+'px)');
			if(phase==$.fn.swipe.phases.PHASE_CANCEL) {
				$(this).removeAttr('style');
			}
		},
		swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
			if (distance > 1 && direction == 'right') {
				if (direction == 'right'){
					if (curQuestion < countQuestion) {
						curQuestion++;
						setQuestion(curQuestion, allQuestions);
					} else {
						setTimeout(function () {
							if (window.matchMedia('(max-width: 1079px)').matches && $('.quiz__block--result').is(':visible')) {
								$('.quiz__pagi').hide();
							} else {
								$('.quiz__pagi').show();
							}
						}, 100);
						showResults(points);
					}

					slideAnswer(direction);
				}
			}
		},
		threshold:100
	});

	function slideQuest(direction){
		$('.quiz__content').removeClass('swipe');
		let shift = "+=100";
		if (direction === 'left') shift = "-=100";
		$('.quiz__content--answer').removeClass('blur');
		$('.quiz__content--quest').animate({
			opacity : 0,
			left : shift
		},500,function (){
			$('.quiz__content--quest').removeClass('front').removeAttr('style');
			$('.quiz__content--answer').addClass('front');
		});
		$('.quiz__sides--answer').removeClass('hide');
		$('.quiz__sides--quest').addClass('hide');

		if ($(window).width() < 1080){
			let targetHeight = $('.quiz__cards').data('height');
			if (targetHeight){
				$('.quiz__cards').css('height',targetHeight);
			}
		}
	}

	function slideAnswer(direction){
		$('.quiz__content').removeClass('swipe');
		let shift = "+=100";
		if (direction === 'left') shift = "-=100";
		$('.quiz__content--answer').animate({
			opacity : 0,
			left : shift
		},500,function (){
			$('.quiz__content--answer').removeClass('front').removeAttr('style').addClass('blur');
			$('.quiz__content--quest').addClass('front');
		});
		$('.quiz__sides--answer').addClass('hide');
		$('.quiz__sides--quest').removeClass('hide');
	}


	/* Кнопки выбора */
	$('.quiz__choice--true.quiz__sides--quest,.quiz__choice--false.quiz__sides--quest').click(function () {
		var choise = $(this).attr('data-correct');

		let dBlock = 'block';
		if($(window).width() < 1080){
			dBlock = 'flex';
		}

		if (allQuestions.test[curQuestion-1].correct === choise) {
			points++;
			$('.quiz__choice--correct').css('display', dBlock);
			$('.quiz__choice--incorrect').hide();
		} else {
			$('.quiz__choice--correct').hide();
			$('.quiz__choice--incorrect').css('display', dBlock);
		}

		/* Цвет круглых паттернов в ответе */
		if (allQuestions.test[curQuestion-1].correct !== choise) {
			$('.circle-small, .circle-big').css('fill', '#E5539B');
		} else {
			$('.circle-small, .circle-big').css('fill', '#77ACD8');
		}

		let direction = 'right';
		if (choise === 'true'){
			direction = 'left';
		}

		slideQuest(direction);
	});

	/* Кнопка следующего вопроса (результата) */
	$('.quiz__next.quiz__sides--answer').on('click', function () {
		if (curQuestion < countQuestion) {
			curQuestion++;
			setQuestion(curQuestion, allQuestions);
		} else {
			showResults(points);
		}
		slideAnswer('right');
	});

	/* Скрываем пагинацию на мобильном разрешении на этапе результатов */
	$('.quiz__next.quiz__sides--answer').on('mouseup', function () {
		setTimeout(function () {
			if (window.matchMedia('(max-width: 1079px)').matches && $('.quiz__block--result').is(':visible')) {
				$('.quiz__pagi').hide();
			} else {
				$('.quiz__pagi').show();
			}
		}, 100)
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
			note = answer.note,
			pagi = $('.quiz__pagi');

		questionNum2.text(questionNum.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}));

		/* Пагинация */
		// Счетчик
		pagi.find('.current').html(questionNum);
		// Смена активного булита
		$('.quiz__dots p.active').removeClass('active').next().addClass('active');

		$('.quiz__step--quest .current').html(num);
		$('.quiz__qiestion-num .quest-digit').html(questionNum);
		$('.quiz__image img').attr('src', img);
		$('.quiz__qiestion').html(question);

		if ($(window).width() < 1080){
			let questPadding = 109;
			let questHeight = $('.quiz__content--quest .quiz__inner').prop('scrollHeight');
			let targetHeight = ( (questHeight + questPadding) / $(window).width() ) * 100;
			$('.quiz__cards').css('height',targetHeight+'vw');
		}

		setTimeout(function (){
			$('.quiz__step--answer .current').html(num);
			$('.quiz__answer').html(title);
			$('.quiz__answer-subtitle').html(subtitle);
			$('.quiz__answer-text').html(text);

			if ($(window).width() < 1080){
				let questPadding = 155;
				let questHeight = $('.quiz__content--answer .quiz__inner').prop('scrollHeight');
				let targetHeight = ( (questHeight + questPadding) / $(window).width() ) * 100;
				$('.quiz__cards').data('height',targetHeight+'vw');
			}

			// Примечание
			if (note) {
				$('.quiz__ps').show().html(note);
			} else {
				$('.quiz__ps').hide();
			}
		},500);
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
			$('.quiz__block--question').hide();
		})
	}

});