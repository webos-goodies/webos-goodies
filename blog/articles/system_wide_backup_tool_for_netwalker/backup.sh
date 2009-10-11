#! /bin/bash

if [ -z $1 ]; then
	echo "usage: backup.sh dir"
	exit 1
fi

if ! [ -d $1 ]; then
	echo "$BACKUP_DIR is not exist or not a directory."
	exit 2
fi

SRC_DIR=/mnt/root
BACKUP_DIR=`dirname $1/a`
KERNEL_DEV=/dev/mtd3
KERNEL_IMG=$BACKUP_DIR/kernel.bin
RSYNC_CMD=rsync
RSYNC_OPTS=-aAX --delete --force --numeric-ids --progress
RSYNC_EXCL=--exclude='/root/dev/***' --exclude='/root/proc/***'

nanddump -o -b $KERNEL_DEV -f $KERNEL_IMG
$RSYNC_CMD $RSYNC_OPTS $RSYNC_EXCL $SRC_DIR $BACKUP_DIR
