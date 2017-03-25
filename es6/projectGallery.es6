/*jshint quotmark: false */
/*jshint white: false */
/*jshint trailing: false */
/*jshint newcap: false */
/*global React */
import React from 'react';
import Gallery from 'react-photo-gallery';
import YouTube from 'react-youtube';
import Measure from 'react-measure';
import Lightbox from 'react-images';
import Loading from 'react-loading';
import _ from 'lodash';

const loadMorePhotosTimeLapse = 200;
const photosSetLoad = 10;

class ProjectGallery extends React.Component {

	constructor(props) {
		super(props);
        this.handleScroll = this.handleScroll.bind(this);
        this.loadMorePhotos = this.loadMorePhotos.bind(this);
        this.closeLightbox = this.closeLightbox.bind(this);
        this.openLightbox = this.openLightbox.bind(this);
        this.gotoNext = this.gotoNext.bind(this);
        this.gotoPrevious = this.gotoPrevious.bind(this);

	}

    componentWillReceiveProps(nextProps) {
        if(nextProps.project){
            this.setState({
                loadedAll: false,
                photos: [],
                videos: nextProps.project.videos,
                photosStore: nextProps.project.images.map(image => {
                    return {
                        src: image.path,
                        srcset: image.srcset,
                        width: image.width,
                        height: image.height
                    };
                })
            });
            this.loadMorePhotos();
        } else { this.setState({ loadedAll: false, photos: [], videos: [], photosStore: []}); }

    }

    componentDidMount() {
        this.loadMorePhotos = _.debounce(this.loadMorePhotos, loadMorePhotosTimeLapse);
        window.addEventListener('scroll', this.handleScroll);
    }

    handleScroll(){
        let scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
        if (this.props.project && !this.state.loadedAll
            && (window.innerHeight + scrollY) >= (document.body.offsetHeight - 50)) {
            this.loadMorePhotos();
        }
    }

    loadMorePhotos(){

        let newPhotos = this.state.photosStore.slice(0, photosSetLoad);
        let newStore = this.state.photosStore.slice(photosSetLoad);
        let loadedAll = newStore.length? false:true;

        this.setState({
            photos: this.state.photos.concat(newPhotos),
            photosStore: newStore,
            loadedAll: loadedAll
        });
    }

    openLightbox(index, event){
        event.preventDefault();
        this.setState({
            currentImage: index,
            lightboxIsOpen: true
        });
    }

    closeLightbox(){
        this.setState({
            currentImage: 0,
            lightboxIsOpen: false,
        });
    }

    gotoPrevious(){
        this.setState({
            currentImage: this.state.currentImage - 1,
        });
    }

    gotoNext(){
        this.setState({
            currentImage: this.state.currentImage + 1,
        });
    }

    renderGallery(){
        return(
			<Measure whitelist={['width']}>
                {
                    ({ width }) => {
                        var cols = 1;
                        if (width >= 480){ cols = 2; }
                        if (width >= 1024){ cols = 3; }
                        return <Gallery photos={this.state.photos} cols={cols} onClickPhoto={this.openLightbox} />
                    }
                }
			</Measure>
        );
    }

    renderVideos() {

        function _onReady(event) {
            // access to player in all event handlers via event.target
            event.target.pauseVideo();
        }

        return this.state.videos.map(videoId => {

            const opts = {
                height: '390',
                width: '640',
                playerVars: { // https://developers.google.com/youtube/player_parameters
                    autoplay: 0
                }
            };

            return <YouTube
                key={videoId}
                videoId={videoId}
                opts={opts}
                onReady={_onReady}
            />
        });
    }

    render() {

        if (!this.props.project) return <div/>;

        return (
            <div className="App">
                {this.renderVideos()}
                {this.renderGallery()}
                <Lightbox
                    images={this.state.photos.concat(this.state.photosStore)}
                    backdropClosesModal={true}
                    onClose={this.closeLightbox}
                    onClickPrev={this.gotoPrevious}
                    onClickNext={this.gotoNext}
                    currentImage={this.state.currentImage}
                    isOpen={this.state.lightboxIsOpen}
                    width={1600}
                />
                {!this.state.loadedAll
                && <div className="loading-msg" id="msg-loading-more"><Loading type='cylon' color='#d2d2d2' width="85"/>
                    <span className="loading-msg-text">Loading</span></div>}
            </div>
        );

	}
};

export default ProjectGallery;