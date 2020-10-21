var index = 0
class SlideShow {
    constructor(slides, opts) {
        this.slides = slides || {}
        this.options = Object.assign({
            random: true,
            root: 'https://source.unsplash.com',
            timeout: 1000,
            size: '400x200'

        }, opts)

    }

    async start($div) {
        console.log(`starting slideshow at ${$div.attr('id')} random=${this.options.random} interval=${this.options.timeout}`)
        //this.timer = setTimeout(this.showSlide.bind(this), this.options.timeout, $div)
        while (!this.stopped) {
            this.stopped = false
            this.showSlide($div)
            await this.sleep(this.options.timeout)
        }
    }

    stop() {
        this.index = 0
        this.stopped = true
    }

    showSlide($div) {
        const image = this.getImageSource()
        console.log('show slide ' + image + ' on ' + $div.attr('id') + ' index=' + index)
        var $image = $('<img>')
        $image.attr('src', image)

        $div.empty()
        $div.append($image)

        index = (index+1) 
        if (!this.options.random) {
            index = index % this.slides.size
        }

    }

    /*
     *
     */
    getImageSource() {
        var src = ''
        if (this.options.random) {
            src = `${this.options.root}/random`
            if (this.options.size) {
                src = src + '/' + this.options.size
            }
            return src
        } else {
            const slide = this.slides[index]
            src = `${this.options.root}/${slide.href}`
            return src
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
}

export default SlideShow