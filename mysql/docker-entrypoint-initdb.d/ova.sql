CREATE DATABASE ova;
USE ova;

DROP TABLE IF EXISTS `analyses`;
CREATE TABLE `analyses` (
  `analysisID` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `akey` varchar(32) NOT NULL,
  PRIMARY KEY (`analysisID`)
);

DROP TABLE IF EXISTS `dbsave`;
CREATE TABLE `dbsave` (
  `nodeSetID` int(11) NOT NULL,
  `text` text NOT NULL,
  `mappings` text NOT NULL,
  PRIMARY KEY (`nodeSetID`)
);

DROP TABLE IF EXISTS `edges`;
CREATE TABLE `edges` (
  `edgeID` varchar(32) NOT NULL,
  `analysisID` mediumint(8) unsigned NOT NULL,
  `content` varchar(2048) NOT NULL,
  PRIMARY KEY (`edgeID`, `analysisID`)
);

DROP TABLE IF EXISTS `edits`;
CREATE TABLE `edits` (
  `editID` mediumint(9) NOT NULL AUTO_INCREMENT,
  `analysisID` mediumint(8) unsigned NOT NULL,
  `sessionid` varchar(20) NOT NULL,
  `type` varchar(12) NOT NULL,
  `action` varchar(12) NOT NULL,
  `contentID` varchar(32) NOT NULL,
  `groupID` int(11) NOT NULL,
  `undone` tinyint(1) NOT NULL DEFAULT '0',
  `versionNo` int(11) DEFAULT NULL,
  `preVersionNo` int(11) DEFAULT NULL,
  PRIMARY KEY (`editID`)
);

DROP TABLE IF EXISTS `nodes`;
CREATE TABLE `nodes` (
  `nodeID` varchar(32) NOT NULL,
  `analysisID` mediumint(8) unsigned NOT NULL,
  `versionNo` int(11) NOT NULL,
  `content` varchar(2048) NOT NULL,
  PRIMARY KEY (`nodeID`, `analysisID`, `versionNo`)
);

DROP TABLE IF EXISTS `texts`;
CREATE TABLE `texts` (
  `textID` varchar(32) NOT NULL,
  `analysisID` mediumint(8) unsigned NOT NULL,
  `content` text NOT NULL,
  PRIMARY KEY (`textID`, `analysisID`)
);