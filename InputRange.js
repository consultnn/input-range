'use strict';

class InputRange {
	constructor(element, options = {}) {
		this.__element = element;
		this.__input = options.input || this.__element.getElementsByTagName('input')[0];
		this.__range = options.range || this.__element.getElementsByClassName('range-slider')[0];

		if (this.__input == null) {
			throw new Error('InputRange: input does not exists');
		}

		this.__min = parseFloat(options.min) || this.__input.dataset.min || this.__range.dataset.min || 0;
		this.__max = parseFloat(options.max) || this.__input.dataset.max || this.__range.dataset.max || 100;
		this.__onChangeCallback = options.onChange || null;
		this.__onRangeChangeCallback = options.onRangeChange || null;
		this.__slider = null;

		if (this.__range) {
			if (window.noUiSlider) {
				noUiSlider.create(this.__range, {
					start: this.__input.value,
					connect: 'lower',
					step: parseInt(this.__range.dataset.step) || 1,
					range: {
						'min': parseInt(this.__input.dataset.min) ||
								parseInt(this.__range.dataset.min) || 0,
						'max': parseInt(this.__input.dataset.max) ||
								parseInt(this.__range.dataset.max) || 100
					}
				});

				this.__slider = this.__range.noUiSlider;

				this.__slider.on('slide.one', this.__onSlide.bind(this));
				this.__slider.on('change', this.__onSlideEnd.bind(this));

				this.__onChange();
			}
		}

		if (this.__input.input) {
			this.__input.onChange = this.__onChange.bind(this);
		} else {
			this.__input.addEventListener('change', this.__onChange.bind(this));
		}
	}

	get element() {
		return this.__element;
	}

	get input() {
		return this.__input;
	}

	get slider() {
		return this.__slider;
	}

	get value() {
		return parseInt(this.input.value);
	}

	set value(newValue) {
		this.input.value = newValue;
		if (this.slider) {
			this.slider.set(newValue);
		}

		this.__dispatchEvent();
	}

	get min() {
		return this.__min;
	}

	set min(newMin) {
		this.__min = newMin;

		if (this.input.min != null) {
			this.input.min = parseInt(newMin);
		} else {
			if (this.input.value < newMin) {
				this.input.value = newMin;

				this.__dispatchEvent();
			}
		}

		if (this.slider) {
			if (this.slider.get() < newMin) {
				this.slider.set(newMin);
			}

			this.slider.updateOptions({
				range: {
					'min': newMin,
					'max': this.max
				}
			});
		}

		if (this.__onRangeChangeCallback) {
			this.__onRangeChangeCallback(this);
		}
	}

	get max() {
		return this.__max;
	}

	set max(newMax) {
		this.__max = newMax;
		if (this.input.max != null) {
			this.input.max = newMax;
		} else {
			if (this.input.value > newMax) {
				this.input.value = newMax;
				this.__dispatchEvent();
			}
		}

		if (this.slider) {
			if (this.slider.get() > newMax) {
				this.slider.set(newMax);
			}

			this.slider.updateOptions({
				range: {
					'min': this.min,
					'max': newMax
				}
			});
		}

		if (this.__onRangeChangeCallback) {
			this.__onRangeChangeCallback(this);
		}
	}

	__onSlide(sliderValue) {
		if (this.input.isPrettyInput) {
			this.input.setValueWithoutEvents(parseInt(sliderValue[0]));
		} else {
			this.input.value = parseInt(sliderValue[0]);
		}
	}

	__onSlideEnd() {
		this.input.value = parseInt(this.slider.get());
		this.__dispatchEvent();
	}

	__onChange() {
		if (this.slider && parseInt(this.slider.get()) != this.input.value) {
			this.slider.set(this.input.value);
		}

		if (this.__onChangeCallback) {
			this.__onChangeCallback(this);
		}
	}

	__dispatchEvent() {
		if (!this.input.isPrettyInput) {
			this.input.dispatchEvent(new Event('change', { bubbles: true }));
		}
	}
}