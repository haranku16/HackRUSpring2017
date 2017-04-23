#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include "portaudio.h" 
#define SAMPLE_RATE 44100
#define NUM_SECONDS 1


typedef struct {
	float left_phase;
	float right_phase;

} paTestData;


static int paTestCallback( const void *inputBuffer, void *outputBuffer,
                           unsigned long framesPerBuffer,
                           const PaStreamCallbackTimeInfo* timeInfo,
                           PaStreamCallbackFlags statusFlags,
                           void *userData)
{
	paTestData * data = (paTestData *) userData;
	float * out = (float *) outputBuffer;
	unsigned int i = 0;
	(void) inputBuffer;
	for(i = 0; i < framesPerBuffer; i++){
		*out++ = data -> left_phase;
		*out++ = data -> right_phase;
		data -> left_phase += 0.01f;
		if(data -> left_phase >= 0.01f) data -> left_phase -= 2.0f;
		data -> right_phase += 0.03f;
		if(data -> right_phase >= 0.01f) data -> right_phase -= 2.0f;

	}
	return 0;
}


int main(int argc, char * argv[]){
	PaError err = Pa_Initialize();
	if(err != paNoError){
		printf("PortAudio Error: %s\n",Pa_GetErrorText(err));
		exit(1);
	}	

	static paTestData data;
    PaStream *stream;
    /* Open an audio I/O stream. */
    err = Pa_OpenDefaultStream( &stream,
                                0,          /* no input channels */
                                2,          /* stereo output */
                                paFloat32,  /* 32 bit floating point output */
                                SAMPLE_RATE,
                                256,        /* frames per buffer, i.e. the number
                                                   of sample frames that PortAudio will
                                                   request from the callback. Many apps
                                                   may want to use
                                                   paFramesPerBufferUnspecified, which
                                                   tells PortAudio to pick the best,
                                                   possibly changing, buffer size.*/
                                paTestCallback, /* this is your callback function */
                                &data ); /*This is a pointer that will be passed to
                                                   your callback*/
    if( err != paNoError ){
		printf("PortAudio Error: %s\n",Pa_GetErrorText(err));
		exit(1);
	}
	/*starts the stream
	*/
	int i = 0;
	for(i = 0; i < 20; i++){
		err = Pa_StartStream( stream );
		if( err != paNoError ){
			printf("PortAudio Error: %s\n",Pa_GetErrorText(err));
			exit(1);
		}
		/* Sleep for several seconds. */
		Pa_Sleep(NUM_SECONDS*1000);
		/*Terminates audio processing. It waits until all pending audio buffers have been played before it returns.
		*/
		err = Pa_StopStream( stream );
		if( err != paNoError ) {
			printf("PortAudio Error: %s\n",Pa_GetErrorText(err));
			exit(1); 
		}
		sleep(1);
	}
	err = Pa_CloseStream( stream );
	if( err != paNoError ) {
		printf("PortAudio Error: %s\n",Pa_GetErrorText(err));
		exit(1);
	}
	err = Pa_Terminate();
	if(err != paNoError){
		printf("PortAudio Error: %s\n",Pa_GetErrorText(err));
		exit(1);
	}

	return 0;
}
