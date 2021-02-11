# build script for Wikispeech
# mimic travis build tests, always run before pushing!

set -e

if [ $# -ne 0 ]; then
    echo "For developers: If you are developing for Wikispeech, and need to make changes to this repository, make sure you run a test build using build_and_test.sh before you make a pull request. Don't run more than one instance of this script at once, and make sure no pronlex server is already running on the default port."
    exit 0
fi


RELEASE=master

basedir=`dirname $0`
basedir=`realpath $basedir`
cd $basedir
builddir="${basedir}/.build"
mkdir -p .build

for proc in `ps --sort pid -Af|egrep 'pronlex|wikispeech|symbolset|marytts|tts_server|ahotts|mishkal' | egrep -v "grep .E"|sed 's/  */\t/g'|cut -f2`; do
    kill $proc || echo "Couldn't kill $pid"
done


## AHOTTS
# cd $builddir
# git clone https://github.com/Elhuyar/AhoTTS-eu-Wikispeech.git && cd AhoTTS-eu-Wikispeech || cd AhoTTS-eu-Wikispeech && git pull
# git checkout $RELEASE || echo "No such release for ahotts. Using master."
# if [ ! -f bin/tts_server ]; then
#     sh script_compile_all_linux.sh && mkdir -p txt wav
# fi
# sh start_ahotts_wikispeech.sh &
# export ahotts_pid=$!
# echo "ahotts started with pid $ahotts_pid"
# sleep 20
# python ahotts_testcall.py "test call for ahotts"


## SYMBOLSET
cd $builddir
git clone https://github.com/stts-se/symbolset
cd symbolset
git checkout $RELEASE || echo "No such release for symbolset. Using master."
cd server
git clone https://github.com/stts-se/wikispeech-lexdata.git
cd wikispeech-lexdata
git checkout $RELEASE || echo "No such release for wikispeech-lexdata. Using master."
cd ..
bash setup.sh wikispeech-lexdata ss_files
go run *.go -ss_files ss_files &
export symbolset_pid=$!
echo "symbolset server started with pid $symbolset_pid"
sleep 2


## PRONLEX
cd $builddir
export GOPATH=`go env GOPATH`
export PATH=$PATH:$GOPATH/bin
cd $GOPATH/src/github.com/stts-se/
git clone https://github.com/stts-se/pronlex.git && cd pronlex || cd pronlex && git pull
git checkout $RELEASE || echo "No such release for pronlex. Using master."
go get ./...

rm -rf ${builddir}/appdir
bash scripts/setup.sh -a ${builddir}/appdir -e sqlite
echo ${builddir}/appdir

bash scripts/import.sh -e sqlite -f wikispeech-lexdata -a ${builddir}/appdir -r $RELEASE

bash scripts/start_server.sh -a ${builddir}/appdir -e sqlite &
export pronlex_pid=$!
echo "pronlex started with pid $pronlex_pid"
sleep 20


## MARYTTS
cd $builddir
git clone https://github.com/stts-se/marytts.git && cd marytts || cd marytts && git pull
git checkout $RELEASE || echo "No such release for marytts. Using master."
 
./gradlew check
./gradlew test
./gradlew installDist

## INSTALL STTS VOICES
cp stts_voices/voice-ar-nah-hsmm-5.2.jar build/install/marytts/lib/
cp stts_voices/voice-dfki-spike-hsmm-5.1.jar build/install/marytts/lib/
cp stts_voices/voice-stts_no_nst-hsmm-5.2.jar build/install/marytts/lib/
cp stts_voices/voice-stts_sv_nst-hsmm-5.2-SNAPSHOT.jar build/install/marytts/lib/
#./gradlew assembleDist
./gradlew run &
export marytts_pid=$!
echo "marytts started with pid $marytts_pid"
sleep 20


## WIKISPEECH FULL
#cd $basedir && python3 bin/wikispeech .travis/travis-min.conf &
cd $basedir && python3 bin/wikispeech wikispeech_server/hanna-maskineri.conf &
export wikispeech_pid=$!  
echo "wikispeech started with pid $wikispeech_pid"
sleep 20


# FINALLY
sh $basedir/.travis/exit_server_and_fail_if_not_running.sh wikispeech $wikispeech_pid
sh $basedir/.travis/exit_server_and_fail_if_not_running.sh marytts $marytts_pid
sh $basedir/.travis/exit_server_and_fail_if_not_running.sh pronlex $pronlex_pid
sh $basedir/.travis/exit_server_and_fail_if_not_running.sh pronlex $symbolset_pid
 
# kill ahotts
#sh $basedir/.travis/exit_server_and_fail_if_not_running.sh ahotts $ahotts_pid
for proc in `ps -f --sort pid|egrep 'tts_server|ahotts|python' | egrep -v  "grep .E"|sed 's/  */\t/g'|cut -f2`; do
    kill $proc || echo "Couldn't kill $pid"
done
