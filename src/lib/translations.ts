export type Locale = "en" | "ar";

export type TranslationKey =
  | "meta.title"
  | "meta.description"
  | "meta.ogTitle"
  | "meta.ogDescription"
  | "meta.ogImageAlt"
  | "nav.dashboard"
  | "nav.healthLogs"
  | "nav.resources"
  | "nav.profile"  | "nav.toolkit"

  | "nav.backToDashboard"
  | "nav.language"
  | "nav.switchToArabic"
  | "nav.switchToEnglish"
  | "header.themeLight"
  | "header.themeDark"
  | "ai.statusLabel"
  | "ai.checking"
  | "ai.live"
  | "ai.mock"
  | "ai.offline"
  | "common.save"
  | "common.cancel"
  | "common.loading"
  | "common.readMore"
  | "common.back"
  | "resources.title"
  | "resources.subtitle"
  | "resources.search"
  | "resources.all"
  | "resources.about"
  | "resources.diagnosis"
  | "resources.treatment"
  | "resources.nutrition"
  | "resources.exercises"
  | "resources.faq"
  | "resources.community"
  | "resources.filterAria"
  | "resources.category.all"
  | "resources.category.managingFlares"
  | "resources.category.nutritionHydration"
  | "resources.category.gentleMovement"
  | "resources.category.mentalSupport"
  | "resources.tipsFor"
  | "resources.card.flarePacing.title"
  | "resources.card.flarePacing.description"
  | "resources.card.flarePacing.tip1"
  | "resources.card.flarePacing.tip2"
  | "resources.card.flarePacing.tip3"
  | "resources.card.flarePacing.tip4"
  | "resources.card.flareHeat.title"
  | "resources.card.flareHeat.description"
  | "resources.card.flareHeat.tip1"
  | "resources.card.flareHeat.tip2"
  | "resources.card.flareHeat.tip3"
  | "resources.card.flareHeat.tip4"
  | "resources.card.antiInflammatory.title"
  | "resources.card.antiInflammatory.description"
  | "resources.card.antiInflammatory.tip1"
  | "resources.card.antiInflammatory.tip2"
  | "resources.card.antiInflammatory.tip3"
  | "resources.card.antiInflammatory.tip4"
  | "resources.card.hydration.title"
  | "resources.card.hydration.description"
  | "resources.card.hydration.tip1"
  | "resources.card.hydration.tip2"
  | "resources.card.hydration.tip3"
  | "resources.card.hydration.tip4"
  | "resources.card.stretching.title"
  | "resources.card.stretching.description"
  | "resources.card.stretching.tip1"
  | "resources.card.stretching.tip2"
  | "resources.card.stretching.tip3"
  | "resources.card.stretching.tip4"
  | "resources.card.walking.title"
  | "resources.card.walking.description"
  | "resources.card.walking.tip1"
  | "resources.card.walking.tip2"
  | "resources.card.walking.tip3"
  | "resources.card.walking.tip4"
  | "resources.card.mindfulness.title"
  | "resources.card.mindfulness.description"
  | "resources.card.mindfulness.tip1"
  | "resources.card.mindfulness.tip2"
  | "resources.card.mindfulness.tip3"
  | "resources.card.mindfulness.tip4"
  | "resources.card.sleepHygiene.title"
  | "resources.card.sleepHygiene.description"
  | "resources.card.sleepHygiene.tip1"
  | "resources.card.sleepHygiene.tip2"
  | "resources.card.sleepHygiene.tip3"
  | "resources.card.sleepHygiene.tip4"
  | "about.title"
  | "about.subtitle"
  | "about.overview"
  | "about.causes"
  | "about.symptoms"
  | "about.causesDetail"
  | "about.symptomsDetail"
  | "diagnosis.title"
  | "diagnosis.subtitle"
  | "diagnosis.howDiagnosed"
  | "diagnosis.tests"
  | "diagnosis.specialist"
  | "diagnosis.criteria"
  | "diagnosis.exams"
  | "treatment.title"
  | "treatment.subtitle"
  | "treatment.medications"
  | "treatment.therapy"
  | "treatment.exercise"
  | "treatment.stress"
  | "treatment.sleep"
  | "treatment.selfCare"
  | "nutrition.title"
  | "nutrition.subtitle"
  | "nutrition.goodFoods"
  | "nutrition.triggers"
  | "nutrition.recipes"
  | "nutrition.hydration"
  | "exercises.title"
  | "exercises.subtitle"
  | "exercises.stretching"
  | "exercises.yoga"
  | "exercises.walking"
  | "exercises.swimming"
  | "exercises.tips"
  | "faq.title"
  | "faq.subtitle"
  | "faq.chronic"
  | "faq.chronicAnswer"
  | "faq.cure"
  | "faq.cureAnswer"
  | "faq.pregnancy"
  | "faq.pregnancyAnswer"
  | "faq.exercise"
  | "faq.exerciseAnswer"
  | "faq.diagnosis"
  | "faq.diagnosisAnswer"
  | "faq.treatment"
  | "faq.treatmentAnswer"
  | "community.title"
  | "community.subtitle"
  | "community.shareStory"
  | "community.stories"
  | "community.tips"
  | "community.support"
  | "community.writePlaceholder"
  | "community.postButton"
  | "community.noStories"
  | "community.loginPrompt"
  | "dashboard.greeting.morning"
  | "dashboard.greeting.afternoon"
  | "dashboard.greeting.evening"
  | "dashboard.todayMessage"
  | "dashboard.streakAria"
  | "dashboard.section.today"
  | "dashboard.section.core"
  | "dashboard.section.insights"
  | "dashboard.toolkitCard.title"
  | "dashboard.toolkitCard.desc"
  | "dashboard.toolkitCard.cta"
  | "dashboard.streakDays"
  | "dashboard.checkin.title"
  | "dashboard.checkin.subtitle"
  | "dashboard.energy.title"
  | "dashboard.energy.goodDay"
  | "dashboard.energy.lowEnergy"
  | "dashboard.energy.flareUp"
  | "dashboard.symptoms.label"
  | "dashboard.symptoms.placeholder"
  | "dashboard.save.saving"
  | "dashboard.save.submit"
  | "dashboard.save.success"
  | "dashboard.support.title"
  | "dashboard.support.subtitle"
  | "dashboard.weekly.title"
  | "dashboard.weekly.subtitle"
  | "dashboard.weekly.avgPain"
  | "dashboard.weekly.daysLogged"
  | "dashboard.weekly.highest"
  | "dashboard.weekly.scale"
  | "dashboard.insights.title"
  | "dashboard.insights.subtitle"
  | "dashboard.insights.empty"
  | "dashboard.toast.message"
  | "dashboard.toast.title"
  | "dashboard.toast.dismissAria"
  | "dashboard.toast.calming"
  | "dashboard.toast.zen"
  | "auth.passwordShow"
  | "auth.passwordHide"
  | "common.close"
  | "privacy.unlockDialogAria"
  | "privacy.lockedTitle"
  | "privacy.enterPin"
  | "privacy.incorrectPin"
  | "privacy.digitAria"
  | "privacy.deleteDigitAria"
  | "privacy.digitsEnteredAria"
  | "privacy.forgotPin"
  | "privacy.useBiometrics"
  | "privacy.biometricScanning"
  | "pricing.title"
  | "pricing.subtitle"
  | "pricing.free.name"
  | "pricing.free.price"
  | "pricing.free.perk1"
  | "pricing.free.perk2"
  | "pricing.free.perk3"
  | "pricing.free.perk4"
  | "pricing.pro.badge"
  | "pricing.pro.name"
  | "pricing.pro.price"
  | "pricing.pro.period"
  | "pricing.pro.perk1"
  | "pricing.pro.perk2"
  | "pricing.pro.perk3"
  | "pricing.pro.perk4"
  | "pricing.upgradeCta"
  | "pricing.comingSoon"
  | "pricing.footnote"
  | "pricing.previewTitle"
  | "pricing.previewBody"
  | "profile.pricing"
  | "privacy.security.title"
  | "privacy.security.subtitle"
  | "privacy.security.encryption"
  | "privacy.security.encryptionDesc"
  | "privacy.security.active"
  | "privacy.security.unavailable"
  | "privacy.security.analytics"
  | "privacy.security.analyticsDesc"
  | "privacy.security.export"
  | "privacy.security.exportDesc"
  | "privacy.security.passphrase"
  | "privacy.security.exportBtn"
  | "privacy.security.exportDone"
  | "privacy.security.exportError"
  | "privacy.security.purge"
  | "privacy.security.purgeDesc"
  | "privacy.security.purgeBtn"
  | "privacy.security.purgeConfirmTitle"
  | "privacy.security.purgeConfirmBody"
  | "privacy.security.purged"
  | "privacy.biometricFailed"
  | "privacy.resetPinTitle"
  | "privacy.resetPinCloseAria"
  | "privacy.resetPinPrompt"
  | "privacy.resetPinNew"
  | "privacy.resetPinConfirm"
  | "privacy.resetPinAction"
  | "privacy.resetPinNotSignedIn"
  | "privacy.resetPinSignIn"
  | "privacy.setupDialogAria"
  | "privacy.protectTitle"
  | "privacy.choosePin"
  | "privacy.confirmPin"
  | "privacy.pinMismatch"
  | "quickActions.ariaLabel"
  | "quickActions.checkin.title"
  | "quickActions.checkin.description"
  | "quickActions.logs.title"
  | "quickActions.logs.description"
  | "quickActions.reports.title"
  | "quickActions.reports.description"
  | "quickActions.resources.title"
  | "quickActions.resources.description"
  | "logging.presets.ariaLabel"
  | "logging.presets.calmDay"
  | "logging.presets.mildFlare"
  | "logging.presets.severeFlare"
  | "logging.symptoms.widespreadPain"
  | "logging.symptoms.fatigue"
  | "logging.symptoms.sleepProblems"
  | "logging.symptoms.fibroFog"
  | "logging.symptoms.headache"
  | "logging.symptoms.tenderPoints"
  | "logging.symptoms.stiffness"
  | "logging.symptoms.sensitivity"
  | "logging.symptoms.selected"
  | "logging.slider.label"
  | "logging.slider.ariaLabel"
  | "logging.slider.calm"
  | "logging.slider.moderate"
  | "logging.slider.intense"
  | "flare.title"
  | "flare.on"
  | "flare.off"
  | "flare.activateAria"
  | "flare.deactivateAria"
  | "flare.dimmedMessage"
  | "flare.armedDescription"
  | "flare.suggestion"
  | "flare.crisisOptionsAria"
  | "flare.crisis.emergencyLabel"
  | "flare.crisis.emergencyValue"
  | "flare.crisis.suicideLabel"
  | "flare.crisis.suicideValue"
  | "flare.crisis.samaritansLabel"
  | "flare.crisis.samaritansValue"
  | "today.title"
  | "today.liveWeather"
  | "today.temp"
  | "today.humidity"
  | "today.pressure"
  | "today.impact.low"
  | "today.impact.high"
  | "today.impact.normal"
  | "today.estimated"
  | "recent.title"
  | "recent.empty"
  | "recent.today"
  | "recent.painAria"
  | "recent.pain.levelLow"
  | "recent.pain.levelMild"
  | "recent.pain.levelModerate"
  | "recent.pain.levelHigh"
  | "recent.pain.levelSevere"
  | "quotes.quote1"
  | "quotes.quote2"
  | "quotes.quote3"
  | "quotes.quote4"
  | "quotes.quote5"
  | "quotes.quote6"
  | "quotes.quote7"
  | "quotes.quote8"
  | "quotes.quote9"
  | "quotes.quote10"
  | "quotes.quote11"
  | "quotes.quote12"
  | "quotes.author"
  | "medical.title"
  | "medical.subtitle"
  | "medical.generate"
  | "medical.analyzing"
  | "medical.avgPain"
  | "medical.flareDays"
  | "medical.logs"
  | "medical.painTrend"
  | "medical.keyInsights"
  | "medical.insightsEmpty"
  | "medical.questions"
  | "medical.summaryFor"
  | "medical.generated"
  | "medical.close"
  | "medical.error"
  | "medical.generatingAria"
  | "medical.question.flare"
  | "medical.question.highPain"
  | "medical.question.fatigue"
  | "medical.question.sensory"
  | "medical.question.movement"
  | "medical.question.tracking"
  | "reports.pageTitle"
  | "reports.pageSubtitle"
  | "reports.loading"
  | "reports.loadError"
  | "reports.snapshotAria"
  | "reports.stat.avgPain"
  | "reports.stat.flareDays"
  | "reports.stat.topSymptoms"
  | "reports.stat.noneRecorded"
  | "reports.insights.subtitle"
  | "reports.insights.empty"
  | "reports.insights.filterLabel"
  | "reports.insights.none"
  | "reports.insights.noneFor"
  | "reports.severity.critical"
  | "reports.severity.warning"
  | "reports.severity.info"
  | "reports.brief.title"
  | "reports.brief.subtitle"
  | "reports.brief.flareFrequency"
  | "reports.brief.flareDaysUnit"
  | "reports.brief.velocity"
  | "reports.brief.functional"
  | "reports.brief.adherence"
  | "reports.brief.medications"
  | "reports.brief.discussion"
  | "reports.filter.all"
  | "reports.download.title"
  | "reports.download.description"
  | "reports.download.generating"
  | "reports.download.button"
  | "reports.exportError"
  | "careInsight.ariaLabel"
  | "careInsight.title"
  | "careInsight.flareCalm"
  | "careInsight.flareMild"
  | "careInsight.flareSevere"
  | "careInsight.easing"
  | "careInsight.watch"
  | "careInsight.title.severeHeat"
  | "careInsight.title.severe"
  | "careInsight.title.mildHeat"
  | "careInsight.title.mild"
  | "careInsight.title.calmHeat"
  | "careInsight.title.calm"
  | "careInsight.heat.severe"
  | "careInsight.heat.mild"
  | "careInsight.heat.calm"
  | "careInsight.humidity.humidSevere"
  | "careInsight.humidity.humid"
  | "careInsight.humidity.dry"
  | "careInsight.humidity.moderate"
  | "careInsight.trend.rising"
  | "careInsight.trend.falling"
  | "careInsight.trend.stable"
  | "careInsight.suggest.severe.1"
  | "careInsight.suggest.severe.2"
  | "careInsight.suggest.severe.3"
  | "careInsight.suggest.mild.1"
  | "careInsight.suggest.mild.2"
  | "careInsight.suggest.mild.3"
  | "careInsight.suggest.calm.1"
  | "careInsight.suggest.calm.2"
  | "careInsight.suggest.calm.3"
  | "insight.highPainAvg.title"
  | "insight.highPainAvg.message"
  | "insight.lowPainAvg.title"
  | "insight.lowPainAvg.message"
  | "insight.frequentFlares.title"
  | "insight.frequentFlares.message"
  | "insight.recurringFlares.title"
  | "insight.recurringFlares.message"
  | "insight.trendWorsening.title"
  | "insight.trendWorsening.message"
  | "insight.trendImproving.title"
  | "insight.trendImproving.message"
  | "insight.weekdayPattern.title"
  | "insight.weekdayPattern.message"
  | "insight.symptomCorrelation.positive.title"
  | "insight.symptomCorrelation.positive.message"
  | "insight.symptomCorrelation.negative.title"
  | "insight.symptomCorrelation.negative.message"
  | "chart.emptyTitle"
  | "chart.emptyHint"
  | "chart.legendPain"
  | "chart.legendAverage"
  | "chart.summary"
  | "chart.aria"
  | "chart.painLevel"
  | "chart.avgLabel"
  | "recovery.sensory.title"
  | "recovery.sensory.on"
  | "recovery.sensory.off"
  | "recovery.sensory.activate"
  | "recovery.sensory.deactivate"
  | "recovery.breath.title"
  | "recovery.breath.description"
  | "recovery.breath.openZen"
  | "recovery.gratitude.title"
  | "recovery.gratitude.description"
  | "recovery.gratitude.ariaLabel"
  | "recovery.gratitude.textareaLabel"
  | "recovery.gratitude.placeholder"
  | "recovery.gratitude.saveEntry"
  | "recovery.gratitude.saved"
  | "recovery.gratitude.chip1"
  | "recovery.gratitude.chip2"
  | "recovery.gratitude.chip3"
  | "spoonTracker.title"
  | "spoonTracker.subtitle"
  | "spoonTracker.undoAria"
  | "spoonTracker.aria"
  | "spoonTracker.removeAria"
  | "spoonTracker.addAria"
  | "spoonTracker.preset.shower"
  | "spoonTracker.preset.walk"
  | "spoonTracker.preset.cooking"
  | "spoonTracker.preset.groceries"
  | "spoonTracker.preset.rest"
  | "spoonTracker.preset.nap"
  | "bodyMap.title"
  | "bodyMap.subtitle"
  | "bodyMap.emptyHint"
  | "bodyMap.point.neck"
  | "bodyMap.point.shoulders"
  | "bodyMap.point.arms"
  | "bodyMap.point.lowerBack"
  | "bodyMap.point.knees"
  | "medication.title"
  | "medication.subtitle"
  | "medication.morningSupplement"
  | "medication.painRelief"
  | "medication.eveningMag"
  | "medication.taken"
  | "medication.pending"
  | "medication.nextDose"
  | "zen.focusBreath"
  | "zen.ultraDark"
  | "zen.exitUltraDark"
  | "zen.switchCalming"
  | "zen.breatheIn"
  | "zen.breatheOut"
  | "zen.soundscapeAria"
  | "zen.sound.rain.label"
  | "zen.sound.rain.description"
  | "zen.sound.forest.label"
  | "zen.sound.forest.description"
  | "zen.sound.whiteNoise.label"
  | "zen.sound.whiteNoise.description"
  | "zen.sound.deepHum.label"
  | "zen.sound.deepHum.description"
  | "narration.title"
  | "narration.explain"
  | "narration.stop"
  | "narration.dismiss"
  | "narration.generatingAria"
  | "narration.offline"
  | "narration.detailedAnalysisTitle"
  | "narration.detailedAnalysisDesc"
  | "narration.patternBody"
  | "narration.aiObservationLabel"
  | "narration.aiObservationText"
  | "narration.missingLogsFallback"
  | "reflection.button"
  | "reflection.stop"
  | "reflection.generatingAria"
  | "reflection.resultLabel"
  | "reflection.dismissAria"
  | "reflection.offline"
  | "companion.openAria"
  | "companion.dialogAria"
  | "companion.title"
  | "companion.waking"
  | "companion.offlineBadge"
  | "companion.liveSimulated"
  | "companion.livePowered"
  | "companion.closeAria"
  | "companion.hello"
  | "companion.suggestion1"
  | "companion.suggestion2"
  | "companion.suggestion3"
  | "companion.offlinePaused"
  | "companion.chatFormAria"
  | "companion.inputLabel"
  | "companion.inputPlaceholder"
  | "companion.checkedData"
  | "companion.errorDefault"
  | "companion.responding"
  | "companion.sendAria"
  | "companion.stopAria"
  | "companion.offlineHint"
  | "companion.mockHint"
  | "logs.pageTitle"
  | "logs.pageSubtitle"
  | "logs.summaryAria"
  | "logs.stat.totalEntries"
  | "logs.stat.avgPain"
  | "logs.stat.flareDays"
  | "logs.stat.totalHint"
  | "logs.stat.avgHint"
  | "logs.stat.flareHint"
  | "logs.empty.title"
  | "logs.empty.description"
  | "logs.empty.cta"
  | "logs.tableTitle"
  | "logs.showing"
  | "logs.searchPlaceholder"
  | "logs.searchAria"
  | "logs.clearAria"
  | "logs.filterLabel"
  | "logs.col.date"
  | "logs.col.pain"
  | "logs.col.mood"
  | "logs.col.notes"
  | "logs.col.action"
  | "logs.noMatch.title"
  | "logs.noMatch.description"
  | "logs.clearFilters"
  | "logs.noNotes"
  | "logs.confirm"
  | "logs.confirmDeleteAria"
  | "logs.deleteAria"
  | "logs.severity.all"
  | "logs.severity.low"
  | "logs.severity.moderate"
  | "logs.severity.severe"
  | "logs.painAria"
  | "profile.pageTitle"
  | "profile.pageSubtitle"
  | "profile.loading"
  | "profile.streakLabel"
  | "profile.days"
  | "profile.totalLogsLabel"
  | "profile.accountTitle"
  | "profile.accountDescription"
  | "profile.displayNameLabel"
  | "profile.displayNamePlaceholder"
  | "profile.saving"
  | "profile.saveChanges"
  | "profile.nameUpdated"
  | "profile.updateFailed"
  | "profile.updateError"
  | "profile.motionTitle"
  | "profile.motionDescription"
  | "profile.gentleMotion"
  | "profile.motionOn"
  | "profile.motionOff"
  | "profile.biometricTitle"
  | "profile.biometricEnable"
  | "profile.biometricEnabled"
  | "profile.biometricDisable"
  | "profile.biometricUnsupported"
  | "video.tab"
  | "video.loading"
  | "video.badge"
  | "video.openExternal"
  | "video.unavailable"
  | "toolkit.title"
  | "toolkit.subtitle"
  | "medications.title"
  | "medications.subtitle"
  | "medications.namePlaceholder"
  | "medications.dosePlaceholder"
  | "medications.timingLabel"
  | "medications.timing.morning"
  | "medications.timing.evening"
  | "medications.timing.bedtime"
  | "medications.add"
  | "medications.remove"
  | "medications.empty"
  | "medications.alerts"
  | "medications.severity.critical"
  | "medications.severity.warning"
  | "medications.severity.caution"
  | "medications.defaultDose"
  | "medications.disclaimer"
  | "somatic.title"
  | "somatic.subtitle"
  | "somatic.painToday"
  | "somatic.spoonsLeft"
  | "somatic.start"
  | "somatic.stop"
  | "somatic.noneSuitable"
  | "somatic.ex.breathing.title"
  | "somatic.ex.breathing.desc"
  | "somatic.ex.humming.title"
  | "somatic.ex.humming.desc"
  | "somatic.ex.eyes.title"
  | "somatic.ex.eyes.desc"
  | "somatic.ex.neck.title"
  | "somatic.ex.neck.desc"
  | "somatic.ex.shoulders.title"
  | "somatic.ex.shoulders.desc"
  | "somatic.ex.catcow.title"
  | "somatic.ex.catcow.desc"
  | "somatic.ex.legs.title"
  | "somatic.ex.legs.desc"
  | "somatic.ex.bodyscan.title"
  | "somatic.ex.bodyscan.desc"
  | "somatic.audio.title"
  | "somatic.audio.binaural432"
  | "somatic.audio.binaural528"
  | "somatic.audio.brown"
  | "somatic.audio.headphonesNote"
  | "somatic.breathing.title"
  | "somatic.breathing.inhale"
  | "somatic.breathing.hold"
  | "somatic.breathing.exhale"
  | "somatic.breathing.idle"
  | "somatic.breathing.idleHint"
  | "somatic.breathing.cycle"
  | "sleep.title"
  | "sleep.subtitle"
  | "sleep.hours"
  | "sleep.awakenings"
  | "sleep.restLabel"
  | "sleep.rest.1"
  | "sleep.rest.2"
  | "sleep.rest.3"
  | "sleep.rest.4"
  | "sleep.rest.5"
  | "sleep.syncWearable"
  | "sleep.deep"
  | "sleep.hrv"
  | "sleep.restingHr"
  | "sleep.alphaDelta"
  | "sleep.alphaDelta.likely"
  | "sleep.alphaDelta.possible"
  | "sleep.alphaDelta.unlikely"
  | "sleep.alphaDelta.insufficient-data"
  | "sleep.deepStatus"
  | "sleep.deep.low"
  | "sleep.deep.normal"
  | "sleep.deep.high"
  | "sleep.deep.unknown"
  | "sleep.fogRisk"
  | "sleep.fogLevel.low"
  | "sleep.fogLevel.moderate"
  | "sleep.fogLevel.high"
  | "sleep.disclaimer"
  | "communityInsights.title"
  | "communityInsights.subtitle"
  | "communityInsights.region"
  | "communityInsights.trendLead"
  | "communityInsights.dominantTrigger"
  | "communityInsights.barometric.falling"
  | "communityInsights.barometric.steady"
  | "communityInsights.barometric.rising"
  | "communityInsights.reportingUsers"
  | "communityInsights.leaderboard"
  | "communityInsights.votes"
  | "communityInsights.disclaimer"
  | "triggers.barometricDrop"
  | "triggers.humidity"
  | "triggers.poorSleep"
  | "triggers.overexertion"
  | "triggers.stress"
  | "coping.pacedBreathing"
  | "coping.warmWaterTherapy"
  | "coping.gradedWalking"
  | "coping.sleepHygiene"
  | "coping.mindfulness"
  | "coping.heatTherapy"
  | "coping.taiChi"
  | "profile.motionToggleAria"
  | "profile.privacyTitle"
  | "profile.privacyDescOn"
  | "profile.privacyDescOff"
  | "profile.newPinLabel"
  | "profile.enableLock"
  | "profile.changePinLabel"
  | "profile.changePinPlaceholder"
  | "profile.update"
  | "profile.disableLock"
  | "profile.lockNow"
  | "profile.signinTitle"
  | "profile.signinDescription"
  | "profile.signedInAs"
  | "profile.signOut"
  | "profile.signInGoogle"
  | "profile.signInGithub"
  | "landing.openMenu"
  | "landing.closeMenu"
  | "landing.signIn"
  | "landing.start"
  | "landing.benefits.pill.core"
  | "landing.benefits.pill.new"
  | "landing.resources.eyebrow"
  | "landing.resources.heading"
  | "landing.resources.viewAll"
  | "landing.resources.card.category.basics"
  | "landing.resources.card.category.diagnosis"
  | "landing.resources.card.category.treatment"
  | "landing.resources.card.category.movement"
  | "landing.resources.card.category.nutrition"
  | "landing.resources.card.category.faq"
  | "landing.resources.card.readGuide"
  | "landing.nav.how"

  | "landing.nav.features"
  | "landing.nav.stories"
  | "landing.nav.faq"
  | "landing.hero.badge"
  | "landing.hero.heading"
  | "landing.hero.subheading"
  | "landing.hero.seeHow"
  | "landing.hero.checkinTitle"
  | "landing.hero.done"
  | "landing.hero.pain"
  | "landing.hero.energy"
  | "landing.hero.sleep"
  | "landing.hero.gentle"
  | "landing.hero.low"
  | "landing.hero.sleepValue"
  | "landing.hero.daily"
  | "landing.hero.pdf"
  | "landing.hero.doctorReady"
  | "landing.hero.minutes"
  | "landing.hero.mockupSub"
  | "landing.hero.freeStart"
  | "landing.hero.noCard"
  | "landing.hero.private"
  | "landing.trust.encrypted"
  | "landing.trust.label"
  | "landing.tagline.eyebrow"
  | "landing.tagline.heading"
  | "landing.tagline.copy"
  | "landing.day.title"
  | "landing.day.rail"
  | "landing.day.scenes"
  | "landing.day.morning"
  | "landing.day.midday"
  | "landing.day.evening"
  | "landing.day.night"
  | "landing.day.morningHeadline"
  | "landing.day.morningCopy"
  | "landing.day.middayHeadline"
  | "landing.day.middayCopy"
  | "landing.day.eveningHeadline"
  | "landing.day.eveningCopy"
  | "landing.day.nightHeadline"
  | "landing.day.nightCopy"
  | "landing.benefits.heading"
  | "landing.benefits.copy"
  | "landing.benefits.checkinsTitle"
  | "landing.benefits.checkinsCopy"
  | "landing.benefits.patternsTitle"
  | "landing.benefits.patternsCopy"
  | "landing.benefits.reportTitle"
  | "landing.benefits.reportCopy"
  | "landing.benefits.toolsTitle"
  | "landing.benefits.toolsCopy"
  | "landing.benefits.privacyTitle"
  | "landing.benefits.privacyCopy"
  | "landing.benefits.readyTitle"
  | "landing.benefits.readyCopy"
  | "landing.how.heading"
  | "landing.how.step1Title"
  | "landing.how.step1Copy"
  | "landing.how.step2Title"
  | "landing.how.step2Copy"
  | "landing.how.step3Title"
  | "landing.how.step3Copy"
  | "landing.testimonials.heading"
  | "landing.testimonials.copy"
  | "landing.testimonials.q1"
  | "landing.testimonials.q2"
  | "landing.testimonials.q3"
  | "landing.testimonials.amiraName"
  | "landing.testimonials.amiraRole"
  | "landing.testimonials.nourName"
  | "landing.testimonials.nourRole"
  | "landing.testimonials.monaName"
  | "landing.testimonials.monaRole"
  | "landing.faq.heading"
  | "landing.faq.copy"
  | "landing.faq.resources"
  | "landing.faq.q1"
  | "landing.faq.a1"
  | "landing.faq.q2"
  | "landing.faq.a2"
  | "landing.faq.q3"
  | "landing.faq.a3"
  | "landing.faq.q4"
  | "landing.faq.a4"
  | "landing.faq.q5"
  | "landing.faq.a5"
  | "landing.faq.q6"
  | "landing.faq.a6"
  | "landing.final.heading"
  | "landing.final.copy"
  | "landing.final.free"
  | "landing.marquee.words"
  | "landing.footer.tagline"
  | "landing.footer.resources"
  | "landing.footer.product"
  | "landing.footer.about"
  | "landing.footer.diagnosis"
  | "landing.footer.treatment"
  | "landing.footer.exercises"
  | "landing.footer.nutrition"
  | "landing.footer.faq"
  | "landing.footer.privacy"
  | "landing.footer.terms"
  | "landing.footer.madeWith"
  | "landing.footer.disclaimer"
  | "landing.footer.copyright";

export const translations: Record<Locale, Record<TranslationKey, string>> = {
  en: {
    "nav.dashboard": "Dashboard",
    "nav.healthLogs": "Health Logs",
    "nav.resources": "Resources",
    "nav.profile": "Profile",
    "nav.toolkit": "Toolkit (حقيبة العناية)",
    "nav.backToDashboard": "Back to Dashboard",
    "nav.language": "Language",
    "nav.switchToArabic": "Switch to Arabic",
    "nav.switchToEnglish": "Switch to English",
    "header.themeLight": "Switch to light mode",
    "header.themeDark": "Switch to dark mode",
    "ai.statusLabel": "AI Care Companion",
    "ai.checking": "Checking AI status…",
    "ai.live": "Live",
    "ai.mock": "Mock mode",
    "ai.offline": "Offline",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.loading": "Loading...",
    "common.readMore": "Read More",
    "common.back": "Back",
    "resources.title": "Care Resources",
    "resources.subtitle": "Explore guides, tips, and educational content to help you manage fibromyalgia with confidence.",
    "resources.search": "Search resources...",
    "resources.all": "All",
    "resources.about": "About Fibromyalgia",
    "resources.diagnosis": "Diagnosis",
    "resources.treatment": "Treatment & Self-Care",
    "resources.nutrition": "Nutrition",
    "resources.exercises": "Exercises",
    "resources.faq": "FAQ",
    "resources.community": "Community",
    "resources.filterAria": "Filter resources by category",
    "resources.category.all": "All",
    "resources.category.managingFlares": "Managing Flares",
    "resources.category.nutritionHydration": "Nutrition & Hydration",
    "resources.category.gentleMovement": "Gentle Movement",
    "resources.category.mentalSupport": "Mental Support",
    "resources.tipsFor": "Practical tips for {category}.",
    "resources.card.flarePacing.title": "Pacing Techniques",
    "resources.card.flarePacing.description": "Learn how to balance activity and rest to prevent crashes.",
    "resources.card.flarePacing.tip1": "Break tasks into smaller, manageable chunks.",
    "resources.card.flarePacing.tip2": "Set a timer for activities and take a break before you feel tired.",
    "resources.card.flarePacing.tip3": "Prioritize the most important tasks of the day.",
    "resources.card.flarePacing.tip4": "Listen to your body's early warning signs.",
    "resources.card.flareHeat.title": "Gentle Heat Therapy",
    "resources.card.flareHeat.description": "Using warmth to soothe stiff joints and relax muscles.",
    "resources.card.flareHeat.tip1": "Use warm compresses or heating pads on affected areas.",
    "resources.card.flareHeat.tip2": "Try warm baths with Epsom salts to reduce muscle tension.",
    "resources.card.flareHeat.tip3": "Ensure heat sources are not too hot to avoid skin burns.",
    "resources.card.flareHeat.tip4": "Apply warmth for 15-20 minutes at a time.",
    "resources.card.antiInflammatory.title": "Anti-Inflammatory Diet",
    "resources.card.antiInflammatory.description": "Foods that may help reduce inflammation and joint pain.",
    "resources.card.antiInflammatory.tip1": "Incorporate omega-3 rich foods like salmon, walnuts, and flaxseeds.",
    "resources.card.antiInflammatory.tip2": "Eat plenty of colorful berries and leafy greens.",
    "resources.card.antiInflammatory.tip3": "Reduce processed sugars and refined carbohydrates.",
    "resources.card.antiInflammatory.tip4": "Experiment with turmeric and ginger for natural anti-inflammatory properties.",
    "resources.card.hydration.title": "Hydration Strategies",
    "resources.card.hydration.description": "Tips for staying hydrated even when water feels like a chore.",
    "resources.card.hydration.tip1": "Carry a reusable water bottle with you at all times.",
    "resources.card.hydration.tip2": "Try infused water with cucumber or lemon for more flavor.",
    "resources.card.hydration.tip3": "Set reminders to drink water throughout the day.",
    "resources.card.hydration.tip4": "Eat water-rich foods like watermelon and cucumber.",
    "resources.card.stretching.title": "Gentle Stretching",
    "resources.card.stretching.description": "Low-impact ways to maintain flexibility without overexertion.",
    "resources.card.stretching.tip1": "Focus on slow, rhythmic movements.",
    "resources.card.stretching.tip2": "Never push through sharp pain; stretch only to a point of mild tension.",
    "resources.card.stretching.tip3": "Use a chair or wall for support during stretches.",
    "resources.card.stretching.tip4": "Hold stretches for 15-30 seconds and breathe deeply.",
    "resources.card.walking.title": "Low-Impact Walking",
    "resources.card.walking.description": "Ways to incorporate walking into your routine safely.",
    "resources.card.walking.tip1": "Start with very short distances and gradually increase.",
    "resources.card.walking.tip2": "Walk on flat, stable surfaces to avoid falls.",
    "resources.card.walking.tip3": "Wear supportive, comfortable footwear.",
    "resources.card.walking.tip4": "Take frequent breaks and walk in a pace that allows you to talk comfortably.",
    "resources.card.mindfulness.title": "Mindfulness Practices",
    "resources.card.mindfulness.description": "Calming the mind to better manage the emotional toll of pain.",
    "resources.card.mindfulness.tip1": "Practice deep belly breathing for 5 minutes daily.",
    "resources.card.mindfulness.tip2": "Try a guided meditation app for relaxation.",
    "resources.card.mindfulness.tip3": "Focus on a few things you are grateful for each morning.",
    "resources.card.mindfulness.tip4": "Use grounding techniques: find 5 things you can see, 4 you can touch, etc.",
    "resources.card.sleepHygiene.title": "Sleep Hygiene",
    "resources.card.sleepHygiene.description": "Building a routine for deeper, more restorative sleep.",
    "resources.card.sleepHygiene.tip1": "Maintain a consistent sleep and wake schedule.",
    "resources.card.sleepHygiene.tip2": "Avoid screens at least one hour before bed.",
    "resources.card.sleepHygiene.tip3": "Create a calming bedtime ritual (e.g., herbal tea, light reading).",
    "resources.card.sleepHygiene.tip4": "Keep your bedroom cool, dark, and quiet.",
    "about.title": "About Fibromyalgia",
    "about.subtitle": "Understanding your condition is the first step toward better management.",
    "about.overview": "What is Fibromyalgia?",
    "about.causes": "Potential Causes",
    "about.symptoms": "Common Symptoms",
    "about.causesDetail": "The exact cause of fibromyalgia is not fully understood, but researchers believe it involves a combination of genetic, environmental, and psychological factors. Key theories include:\n\nAbnormal pain processing: The central nervous system amplifies pain signals, making you more sensitive to stimuli.\n\nGenetic factors: Fibromyalgia tends to run in families, suggesting certain genetic mutations may increase susceptibility.\n\nPhysical or emotional trauma: Post-traumatic stress disorder (PTSD), surgery, or significant emotional distress can trigger the condition.\n\nSleep disturbances: Chronic sleep disorders like restless legs syndrome or sleep apnea are commonly associated.\n\nInfections: Some illnesses appear to trigger or worsen fibromyalgia symptoms.",
    "about.symptomsDetail": "The hallmark symptom of fibromyalgia is widespread musculoskeletal pain, but the condition affects many body systems:\n\nWidespread Pain: A persistent dull ache lasting at least three months, occurring on both sides of the body and above and below the waist.\n\nFatigue: Even after sleeping for long periods, people with fibromyalgia often wake up tired. Sleep is frequently disrupted by pain.\n\nCognitive Difficulties (Fibro Fog): Problems with concentration, attention, and memory are common.\n\nSleep Problems: Many patients experience insomnia or non-restorative sleep.\n\nHeadaches and Migraines: Frequent tension headaches or migraines.\n\nStiffness: Especially noticeable in the morning upon waking.\n\nSensitivity: Heightened sensitivity to light, noise, temperature, and odors.\n\nDigestive Issues: Irritable bowel syndrome (IBS) frequently co-occurs.",
    "diagnosis.title": "Diagnosis",
    "diagnosis.subtitle": "Learn how fibromyalgia is diagnosed and what to expect during the process.",
    "diagnosis.howDiagnosed": "How is Fibromyalgia Diagnosed?",
    "diagnosis.tests": "Tests and Evaluations",
    "diagnosis.specialist": "When to See a Specialist",
    "diagnosis.criteria": "Fibromyalgia is diagnosed based on symptoms and by ruling out other conditions. The American College of Rheumatology criteria include:\n\nWidespread pain index (WPI) and symptom severity scale (SSS) scoring\nPain and symptoms present for at least three months\nNo other disorder that would otherwise explain the pain\n\nDoctors may also use tender point testing, where specific areas of the body are pressed to assess sensitivity.",
    "diagnosis.exams": "While there is no single definitive test for fibromyalgia, your doctor may order tests to rule out other conditions:\n\nComplete Blood Count (CBC): Checks for signs of infection or anemia\nErythrocyte Sedimentation Rate (ESR): Measures inflammation levels\nThyroid Function Tests: Rules out thyroid disorders\nVitamin D Levels: Deficiency can mimic fibromyalgia symptoms\nRheumatoid Factor: Rules out rheumatoid arthritis\nSleep Studies: Identifies sleep disorders that may contribute to symptoms\n\nThese tests help ensure your symptoms are not caused by another treatable condition.",
    "treatment.title": "Treatment & Self-Care",
    "treatment.subtitle": "Medical treatment alongside day-to-day adjustments.",
    "treatment.medications": "Medications",
    "treatment.therapy": "Physical Therapy",
    "treatment.exercise": "Exercise",
    "treatment.stress": "Stress Management",
    "treatment.sleep": "Sleep Hygiene",
    "treatment.selfCare": "Self-Care Strategies",
    "nutrition.title": "Nutrition",
    "nutrition.subtitle": "What you eat can significantly impact your fibromyalgia symptoms.",
    "nutrition.goodFoods": "Foods That Help",
    "nutrition.triggers": "Common Triggers",
    "nutrition.recipes": "Meal Ideas",
    "nutrition.hydration": "Hydration",
    "exercises.title": "Exercises",
    "exercises.subtitle": "Gentle, consistent movement is key to managing fibromyalgia pain and stiffness.",
    "exercises.stretching": "Gentle Stretching",
    "exercises.yoga": "Restorative Yoga",
    "exercises.walking": "Low-Impact Walking",
    "exercises.swimming": "Aquatic Exercise",
    "exercises.tips": "Exercise Tips",
    "faq.title": "Frequently Asked Questions",
    "faq.subtitle": "Answers to common questions about living with fibromyalgia.",
    "faq.chronic": "Is fibromyalgia a chronic condition?",
    "faq.chronicAnswer": "Yes, fibromyalgia is considered a chronic (long-term) condition. However, symptoms can fluctuate over time, with periods of flare-ups and remission. Many people learn to manage their symptoms effectively with the right treatment plan and lifestyle adjustments.",
    "faq.cure": "Is there a cure for fibromyalgia?",
    "faq.cureAnswer": "Currently, there is no known cure for fibromyalgia. However, a combination of medication, therapy, exercise, stress management, and lifestyle changes can significantly reduce symptoms and improve quality of life. Ongoing research continues to explore new treatment approaches.",
    "faq.pregnancy": "Does fibromyalgia affect pregnancy?",
    "faq.pregnancyAnswer": "Fibromyalgia does not typically cause complications during pregnancy, but symptoms may change. Some women experience improvement during pregnancy, while others may have increased pain or fatigue. It is important to work with your healthcare provider to manage symptoms safely during pregnancy.",
    "faq.exercise": "Is exercise safe with fibromyalgia?",
    "faq.exerciseAnswer": "Yes, gentle exercise is actually one of the most effective treatments for fibromyalgia. Low-impact activities like walking, swimming, stretching, and yoga can reduce pain, improve sleep, and boost mood. Start slowly, listen to your body, and gradually increase activity levels.",
    "faq.diagnosis": "How long does diagnosis take?",
    "faq.diagnosisAnswer": "Diagnosis can take time because fibromyalgia symptoms overlap with many other conditions. On average, it may take several months to years from symptom onset to diagnosis. Keeping a symptom diary and seeking evaluation from a rheumatologist can help speed the process.",
    "faq.treatment": "What treatments work best?",
    "faq.treatmentAnswer": "The most effective approach is typically multimodal, combining medications (such as duloxetine or pregabalin), physical therapy, regular gentle exercise, cognitive behavioral therapy (CBT), and stress management techniques. What works best varies from person to person, so finding the right combination often requires patience and open communication with your healthcare team.",
    "community.title": "Community",
    "community.subtitle": "A warm space for sharing experiences, tips, and support with others who understand.",
    "community.shareStory": "Share Your Story",
    "community.stories": "Patient Stories",
    "community.tips": "Peer Tips",
    "community.support": "Support & Encouragement",
    "community.writePlaceholder": "Share your experience, a helpful tip, or words of encouragement...",
    "community.postButton": "Share",
    "community.noStories": "Be the first to share your story. Your experience could help someone else feel less alone.",
    "community.loginPrompt": "Log in to share your story and connect with others.",
    "dashboard.greeting.morning": "Good morning",
    "dashboard.greeting.afternoon": "Good afternoon",
    "dashboard.greeting.evening": "Good evening",
    "dashboard.todayMessage": "Take a moment to check in with your body today.",
    "dashboard.streakAria": "{count} day logging streak",
    "dashboard.streakDays": "day streak",
    "dashboard.checkin.title": "How are you feeling today?",
    "dashboard.checkin.subtitle": "Tracking your energy and symptoms helps manage flares and improve care.",
    "dashboard.energy.title": "How is your energy today?",
    "dashboard.energy.goodDay": "Good Day",
    "dashboard.energy.lowEnergy": "Low Energy",
    "dashboard.energy.flareUp": "Flare-up",
    "dashboard.symptoms.label": "Symptoms & Notes (Optional)",
    "dashboard.symptoms.placeholder": "How are you feeling specifically? Any triggers or symptoms?",
    "dashboard.save.saving": "Saving...",
    "dashboard.save.submit": "Log Today's Entry",
    "dashboard.save.success": "Log saved successfully!",
    "dashboard.support.title": "Gentle Support",
    "dashboard.support.subtitle": "Quick tools to soothe your nervous system and lift your mood.",
    "dashboard.weekly.title": "Weekly Progress",
    "dashboard.weekly.subtitle": "Your pain levels over the last 7 days.",
    "dashboard.weekly.avgPain": "Avg pain",
    "dashboard.weekly.daysLogged": "Days logged",
    "dashboard.weekly.highest": "Highest",
    "dashboard.weekly.scale": "/10",
    "dashboard.insights.title": "AI Insights",
    "dashboard.insights.subtitle": "Patterns detected from your recent logs.",
    "dashboard.insights.empty": "Log at least 5 days of pain and symptoms to get personalized insights.",
    "dashboard.toast.message": "It looks like a tough day. Would you like to switch to Calming Mode and take 3 minutes for yourself?",
    "dashboard.toast.title": "We're here with you",
    "dashboard.toast.dismissAria": "Dismiss message",
    "dashboard.toast.calming": "Calming Mode",
    "dashboard.toast.zen": "Zen Portal",
    "auth.passwordShow": "Show {label}",
    "auth.passwordHide": "Hide {label}",
    "common.close": "Close",
    "privacy.unlockDialogAria": "Enter your PIN to unlock FibroCare",
    "privacy.lockedTitle": "Your space is locked",
    "privacy.enterPin": "Enter your 4-digit PIN",
    "privacy.incorrectPin": "Incorrect PIN. Try again.",
    "privacy.digitAria": "Digit {digit}",
    "privacy.deleteDigitAria": "Delete last digit",
    "privacy.digitsEnteredAria": "{length} of {total} digits entered",
    "privacy.forgotPin": "Forgot PIN?",
    "privacy.useBiometrics": "Use Biometrics",
    "privacy.biometricScanning": "Waiting for biometric sensor…",
    "pricing.title": "FibroCare plans",
    "pricing.subtitle": "Your logs and data are always free. Pro adds the deeper AI work on top.",
    "pricing.free.name": "Free",
    "pricing.free.price": "$0",
    "pricing.free.perk1": "Unlimited pain, symptom & spoon logging",
    "pricing.free.perk2": "Body map, flare mode & somatic toolkit",
    "pricing.free.perk3": "Offline install (PWA) with local encryption",
    "pricing.free.perk4": "30/90-day PDF summary",
    "pricing.pro.badge": "Pro",
    "pricing.pro.name": "FibroCare Pro",
    "pricing.pro.price": "$6",
    "pricing.pro.period": "/ month",
    "pricing.pro.perk1": "Empathic AI Companion with your health memory",
    "pricing.pro.perk2": "Doctor-ready clinical brief & PDF export",
    "pricing.pro.perk3": "Time-series flare & weather predictor",
    "pricing.pro.perk4": "Guided video masterclasses",
    "pricing.upgradeCta": "Upgrade to Pro",
    "pricing.comingSoon": "Coming soon",
    "pricing.footnote": "Cancel anytime. Your health data never leaves your device unless you export it yourself.",
    "pricing.previewTitle": "This is a Pro feature",
    "pricing.previewBody": "You can see a preview here. Pro unlocks the full version, and your logs stay free either way.",
    "profile.pricing": "Upgrade · FibroCare Pro",
    "privacy.security.title": "Privacy & security",
    "privacy.security.subtitle": "Your health data stays on your device unless you export it yourself.",
    "privacy.security.encryption": "Local data encryption",
    "privacy.security.encryptionDesc": "Sensitive local entries are encrypted with AES-GCM before they are stored in this browser.",
    "privacy.security.active": "Active",
    "privacy.security.unavailable": "Unavailable",
    "privacy.security.analytics": "Opt out of analytics",
    "privacy.security.analyticsDesc": "No analytics run today, and this preference is stored so any future analytics skips you.",
    "privacy.security.export": "Export my data",
    "privacy.security.exportDesc": "Downloads an encrypted JSON copy of everything stored locally. Choose a passphrase of at least 8 characters; it never leaves this device, and the file cannot be read without it.",
    "privacy.security.passphrase": "Export passphrase (min 8 chars)",
    "privacy.security.exportBtn": "Export",
    "privacy.security.exportDone": "Encrypted export downloaded. Keep the passphrase safe; it cannot be recovered.",
    "privacy.security.exportError": "Export failed. Check that the passphrase is at least 8 characters.",
    "privacy.security.purge": "Purge all local health data",
    "privacy.security.purgeDesc": "Removes every FibroCare entry from this browser: local caches, preferences, session state, and offline files. Your language preference and server data are not affected.",
    "privacy.security.purgeBtn": "Purge now",
    "privacy.security.purgeConfirmTitle": "Delete everything FibroCare stored in this browser?",
    "privacy.security.purgeConfirmBody": "This cannot be undone. Local logs, preferences, and offline caches on this device will be gone. Your account data on the server stays.",
    "privacy.security.purged": "Removed {count} local item(s){items}.",
    "privacy.biometricFailed": "Biometric unlock failed. Please try again.",
    "privacy.resetPinTitle": "Reset privacy PIN",
    "privacy.resetPinCloseAria": "Close reset PIN dialog",
    "privacy.resetPinPrompt": "Choose a new 4-digit PIN for {email}.",
    "privacy.resetPinNew": "New PIN",
    "privacy.resetPinConfirm": "Confirm new PIN",
    "privacy.resetPinAction": "Reset PIN",
    "privacy.resetPinNotSignedIn": "You need to be signed in to reset your PIN.",
    "privacy.resetPinSignIn": "Sign in",
    "privacy.setupDialogAria": "Set a privacy PIN",
    "privacy.protectTitle": "Protect your health data",
    "privacy.choosePin": "Choose a 4-digit PIN",
    "privacy.confirmPin": "Confirm your PIN",
    "privacy.pinMismatch": "PINs did not match. Start over.",
    "quickActions.ariaLabel": "Quick actions",
    "quickActions.checkin.title": "Daily Check-in",
    "quickActions.checkin.description": "Log your energy, pain and symptoms",
    "quickActions.logs.title": "Health Logs",
    "quickActions.logs.description": "Browse your check-in history",
    "quickActions.reports.title": "Medical Reports",
    "quickActions.reports.description": "Export a summary for your care team",
    "quickActions.resources.title": "Care Resources",
    "quickActions.resources.description": "Gentle guidance and practical tips",
    "logging.presets.ariaLabel": "Quick check-in presets",
    "logging.presets.calmDay": "Calm Day",
    "logging.presets.mildFlare": "Mild Flare",
    "logging.presets.severeFlare": "Severe Flare",
    "logging.symptoms.widespreadPain": "Widespread Pain",
    "logging.symptoms.fatigue": "Fatigue",
    "logging.symptoms.sleepProblems": "Sleep Problems",
    "logging.symptoms.fibroFog": "Fibro Fog",
    "logging.symptoms.headache": "Headache / Migraine",
    "logging.symptoms.tenderPoints": "Tender Points",
    "logging.symptoms.stiffness": "Stiffness",
    "logging.symptoms.sensitivity": "Light / Noise Sensitivity",
    "logging.symptoms.selected": "(selected)",
    "logging.slider.label": "Pain Level",
    "logging.slider.ariaLabel": "Pain level",
    "logging.slider.calm": "Calm",
    "logging.slider.moderate": "Moderate",
    "logging.slider.intense": "Intense",
    "flare.title": "Flare Emergency Mode",
    "flare.on": "On",
    "flare.off": "Off",
    "flare.activateAria": "Activate Flare Emergency Mode",
    "flare.deactivateAria": "Deactivate Flare Emergency Mode",
    "flare.dimmedMessage": "The screen is dimmed and motion stilled. You are not alone. Here are the people who can help right now.",
    "flare.armedDescription": "Tap to arm a calming, de-cluttered view with crisis resources for a severe flare.",
    "flare.suggestion": " Your latest check-in looks like a flare-up. Consider switching this on.",
    "flare.crisisOptionsAria": "Crisis support options",
    "flare.crisis.emergencyLabel": "In immediate danger? Call emergency services",
    "flare.crisis.emergencyValue": "911 (or local)",
    "flare.crisis.suicideLabel": "Crisis support for the US/Canada",
    "flare.crisis.suicideValue": "988 Suicide & Crisis Lifeline",
    "flare.crisis.samaritansLabel": "UK / Ireland Samaritans",
    "flare.crisis.samaritansValue": "116 123 (free, 24/7)",
    "today.title": "Today's Context",
    "today.liveWeather": "Live weather · {location}",
    "today.temp": "Temp",
    "today.humidity": "Humidity",
    "today.pressure": "hPa",
    "today.impact.low": "Low pressure may increase pain sensitivity",
    "today.impact.high": "High pressure can trigger headaches",
    "today.impact.normal": "Pressure is within comfortable range",
    "today.estimated": "Estimated values (weather API not configured).",
    "recent.title": "Recent Logs",
    "recent.empty": "No logs yet. Start tracking to see your history here.",
    "recent.today": "Today",
    "recent.painAria": "Pain level {level}",
    "recent.pain.levelLow": "Low",
    "recent.pain.levelMild": "Mild",
    "recent.pain.levelModerate": "Moderate",
    "recent.pain.levelHigh": "High",
    "recent.pain.levelSevere": "Severe",
    "quotes.quote1": "Your body is your home. Treat it with the kindness it deserves.",
    "quotes.quote2": "Rest is not laziness. It is the foundation of healing.",
    "quotes.quote3": "Every small step forward is still progress. Be gentle with yourself.",
    "quotes.quote4": "You are more than your diagnosis. Your strength defines you.",
    "quotes.quote5": "Listen to your body today. It knows what it needs.",
    "quotes.quote6": "Healing is not linear. Every bad day is followed by a better one.",
    "quotes.quote7": "You deserve compassion, especially from yourself.",
    "quotes.quote8": "Breathe in calm, breathe out tension. You are safe in this moment.",
    "quotes.quote9": "Your worth is not measured by your productivity.",
    "quotes.quote10": "Today, choose peace over perfection.",
    "quotes.quote11": "Gentle movement, gentle thoughts, gentle self-talk.",
    "quotes.quote12": "You have survived every hard day so far. You will survive this one too.",
    "quotes.author": "FibroCare",
    "medical.title": "Smart Medical Summary",
    "medical.subtitle": "Key insights, pain trends, and questions to bring to your doctor.",
    "medical.generate": "Generate Medical Summary",
    "medical.analyzing": "Analyzing…",
    "medical.avgPain": "Avg pain",
    "medical.flareDays": "Flare days",
    "medical.logs": "Logs",
    "medical.painTrend": "Pain Trend (last 7 days)",
    "medical.keyInsights": "Key Insights",
    "medical.insightsEmpty": "Keep logging. After 5 days of pain and symptoms, personalized insights show up.",
    "medical.questions": "Questions for Your Doctor",
    "medical.summaryFor": "Medical Summary for {name}",
    "medical.generated": "Generated {date}",
    "medical.close": "Close",
    "medical.error": "Could not generate your summary.",
    "medical.generatingAria": "Generating AI questions",
    "medical.question.flare": "We logged {count} flare day{plural} in the last 30 days. Could we review what may be triggering them and adjust my plan?",
    "medical.question.highPain": "My average pain has been high. Are my current medications and doses still the right fit?",
    "medical.question.fatigue": "Fatigue and sleep issues keep showing up in my logs. Can we look at energy management and sleep strategies?",
    "medical.question.sensory": "Sensory sensitivity appears in my pattern. Are there pacing or environmental changes that could reduce it?",
    "medical.question.movement": "What movement or physiotherapy level is safe for me right now without worsening symptoms?",
    "medical.question.tracking": "How should I track or log differently so our next review is even more useful?",
    "reports.pageTitle": "Medical Reports",
    "reports.pageSubtitle": "A 90-day summary of your pain, flares, symptoms, and patterns, ready for your specialist.",
    "reports.loading": "Analyzing your health data…",
    "reports.loadError": "Could not load report data.",
    "reports.snapshotAria": "Report snapshot",
    "reports.stat.avgPain": "Avg Pain · 90 days",
    "reports.stat.flareDays": "Flare-up days",
    "reports.stat.topSymptoms": "Top symptoms",
    "reports.stat.noneRecorded": "None recorded",
    "reports.insights.subtitle": "Data-driven observations from your logs.",
    "reports.insights.empty": "Log at least 5 days of pain and symptoms to get personalized insights.",
    "reports.insights.filterLabel": "Filter insights by severity",
    "reports.insights.none": "No insights yet. Keep logging consistently.",
    "reports.insights.noneFor": "No {filter} insights right now.",
    "reports.severity.critical": "Critical",
    "reports.severity.warning": "Watch",
    "reports.severity.info": "Note",
    "reports.brief.title": "AI Clinical Executive Brief (30 days)",
    "reports.brief.subtitle": "A one-page snapshot of your trends, prepared in clinical language for your care team.",
    "reports.brief.flareFrequency": "Flare frequency",
    "reports.brief.flareDaysUnit": "flare day(s)",
    "reports.brief.velocity": "Symptom velocity",
    "reports.brief.functional": "Functional capacity",
    "reports.brief.adherence": "logging adherence",
    "reports.brief.medications": "Patient-reported medications",
    "reports.brief.discussion": "Suggested discussion points",
    "reports.filter.all": "All",
    "reports.download.title": "Clinical Summary PDF",
    "reports.download.description": "Includes the 30-day pain trend chart, correlation summary, key insights, and the full log annex.",
    "reports.download.generating": "Generating Report…",
    "reports.download.button": "Download PDF Report",
    "reports.exportError": "Failed to generate report",
    "careInsight.ariaLabel": "AI care insight",
    "careInsight.title": "AI Care Insight",
    "careInsight.flareCalm": "calm flare",
    "careInsight.flareMild": "mild flare",
    "careInsight.flareSevere": "severe flare",
    "careInsight.easing": "easing",
    "careInsight.watch": "watch",
    "careInsight.title.severeHeat": "A flare day with heat. Let's protect your calm",
    "careInsight.title.severe": "A flare day. Keep your support close",
    "careInsight.title.mildHeat": "Mild discomfort with heat. Small steps help",
    "careInsight.title.mild": "Mild discomfort, and gentle care goes a long way",
    "careInsight.title.calmHeat": "Calm day, warm weather. Keep your rhythm",
    "careInsight.title.calm": "A steady, calm day. Nurture it",
    "careInsight.heat.severe": "Heat and inflammation can make flare pain harder to manage. Keep the room cool and give your body extra rest.",
    "careInsight.heat.mild": "The heat can amplify achiness at your level. Staying cool and hydrated now can keep discomfort from climbing.",
    "careInsight.heat.calm": "Today's warmth is mild enough to stay comfortable. Keep water close and avoid the midday sun.",
    "careInsight.humidity.humidSevere": "High humidity can press on sensitive joints. A dehumidifier or fan in your space can make the room feel gentler.",
    "careInsight.humidity.humid": "The air is humid today, which can add a heavy feeling. Light layers and airflow help.",
    "careInsight.humidity.dry": "Very dry air can irritate skin and sinuses. A little extra water and a humidifier keep things comfortable.",
    "careInsight.humidity.moderate": "Humidity is in a comfortable range today.",
    "careInsight.trend.rising": "Your pain has been gently trending up this week, so pacing matters more than usual today.",
    "careInsight.trend.falling": "Your pain has been easing over recent days. A good moment for light, careful movement.",
    "careInsight.trend.stable": "Your pain has been steady this week.",
    "careInsight.suggest.severe.1": "Rest in a cool, low-light room and limit activity to essential tasks.",
    "careInsight.suggest.severe.2": "Try a cool compress on tense areas and hydrate steadily.",
    "careInsight.suggest.severe.3": "Switch on Calming Mode for 3 minutes of slow breathing.",
    "careInsight.suggest.mild.1": "Take a short gentle walk or do light stretching to keep circulation moving.",
    "careInsight.suggest.mild.2": "Keep water nearby and pace tasks with a small break between them.",
    "careInsight.suggest.mild.3": "Note how your body responds so tomorrow's check-in is easier.",
    "careInsight.suggest.calm.1": "Keep your usual gentle routine and stay hydrated.",
    "careInsight.suggest.calm.2": "Spend a few quiet minutes outdoors while the weather supports it.",
    "careInsight.suggest.calm.3": "Keep logging consistently. Patterns become clearer every day.",
    "insight.highPainAvg.title": "High pain levels",
    "insight.highPainAvg.message": "Your average pain over the last {days} days is {avg}/10, in the high range. Consider discussing your current plan with your care team.",
    "insight.lowPainAvg.title": "Pain Is Well Managed",
    "insight.lowPainAvg.message": "Your average pain is {avg}/10. Whatever you're doing is working. Keep it up.",
    "insight.frequentFlares.title": "Frequent Flare-ups",
    "insight.frequentFlares.message": "You logged {count} flare-level days (pain ≥ 7) in the last {days} days. Frequent flares may signal a need for a treatment review.",
    "insight.recurringFlares.title": "Recurring Flare Days",
    "insight.recurringFlares.message": "You've had {count} flare-level days recently. Patterns of flares often follow sleep, stress, or activity changes.",
    "insight.trendWorsening.title": "Pain Trending Upward",
    "insight.trendWorsening.message": "Your pain has risen by {delta} points between the first and second half of this period.",
    "insight.trendImproving.title": "Pain Trending Downward",
    "insight.trendImproving.message": "Your pain has eased by {delta} points across this period. Keep following what helps.",
    "insight.weekdayPattern.title": "Weekday Pattern",
    "insight.weekdayPattern.message": "{day} tends to be your hardest day (avg {avg}/10 across {count} logs). Planning lighter on that day may help.",
    "insight.symptomCorrelation.positive.title": "Symptom-Pain Link Detected",
    "insight.symptomCorrelation.positive.message": "Days with \"{symptom}\" average {delta} points higher pain ({count} occurrences). Worth tracking closely.",
    "insight.symptomCorrelation.negative.title": "Symptom Seen on Easier Days",
    "insight.symptomCorrelation.negative.message": "\"{symptom}\" appears mostly on lighter days ({delta} lower pain). It may be more of an outcome than a trigger.",
    "chart.emptyTitle": "No pain entries in the last 7 days.",
    "chart.emptyHint": "Log your check-in above to start your weekly progress.",
    "chart.legendPain": "Pain level",
    "chart.legendAverage": "Weekly average",
    "chart.summary": "Highest {max} out of 10, lowest {min} out of 10.",
    "chart.aria": "Weekly pain progress. {text}",
    "chart.painLevel": "/10",
    "chart.avgLabel": "avg {avg}",
    "recovery.sensory.title": "Sensory Rest",
    "recovery.sensory.on": "Sensitive mode is on: screen dimmed and motion stilled.",
    "recovery.sensory.off": "Dim the screen and disable animations for a moment.",
    "recovery.sensory.activate": "Activate Sensitive Mode",
    "recovery.sensory.deactivate": "Deactivate Sensitive Mode",
    "recovery.breath.title": "Mindful Breath",
    "recovery.breath.description": "A 3-minute guided breathing session to lower stress.",
    "recovery.breath.openZen": "Open Zen Portal",
    "recovery.gratitude.title": "Gratitude Journal",
    "recovery.gratitude.description": "Tap a moment or write your own.",
    "recovery.gratitude.ariaLabel": "Quick gratitude prompts",
    "recovery.gratitude.textareaLabel": "Something I am grateful for",
    "recovery.gratitude.placeholder": "Something I'm grateful for...",
    "recovery.gratitude.saveEntry": "Save Entry",
    "recovery.gratitude.saved": "Saved ✓",
    "recovery.gratitude.chip1": "Peaceful moment",
    "recovery.gratitude.chip2": "Good sleep",
    "recovery.gratitude.chip3": "A warm tea",
    "spoonTracker.title": "Spoon Tracker",
    "spoonTracker.subtitle": "Daily energy budget",
    "spoonTracker.undoAria": "Undo last change",
    "spoonTracker.aria": "{current} of {max} spoons remaining",
    "spoonTracker.removeAria": "Remove one spoon",
    "spoonTracker.addAria": "Add one spoon",
    "spoonTracker.preset.shower": "Shower",
    "spoonTracker.preset.walk": "Short Walk",
    "spoonTracker.preset.cooking": "Cooking",
    "spoonTracker.preset.groceries": "Groceries",
    "spoonTracker.preset.rest": "Rest",
    "spoonTracker.preset.nap": "Nap",
    "bodyMap.title": "Pain Map",
    "bodyMap.subtitle": "Tap areas where you feel pain",
    "bodyMap.emptyHint": "Tap a body area to mark pain",
    "bodyMap.point.neck": "Neck",
    "bodyMap.point.shoulders": "Shoulders",
    "bodyMap.point.arms": "Arms",
    "bodyMap.point.lowerBack": "Lower Back",
    "bodyMap.point.knees": "Knees",
    "medication.title": "Today's Medications",
    "medication.subtitle": "Track your doses",
    "medication.morningSupplement": "Morning Supplement",
    "medication.painRelief": "Pain Relief",
    "medication.eveningMag": "Evening Magnesium",
    "medication.taken": "Taken",
    "medication.pending": "Pending",
    "medication.nextDose": "Next dose in",
    "zen.focusBreath": "Focus on your breath",
    "zen.ultraDark": "Ultra Dark",
    "zen.exitUltraDark": "Exit Ultra Dark",
    "zen.switchCalming": "Switch to Calming Mode",
    "zen.breatheIn": "Breathe In ({seconds}s)",
    "zen.breatheOut": "Breathe Out ({seconds}s)",
    "zen.soundscapeAria": "Soundscape mixer",
    "zen.sound.rain.label": "Rain",
    "zen.sound.rain.description": "Soft falling rain",
    "zen.sound.forest.label": "Forest",
    "zen.sound.forest.description": "Deep woodland ambience",
    "zen.sound.whiteNoise.label": "White Noise",
    "zen.sound.whiteNoise.description": "Steady static",
    "zen.sound.deepHum.label": "Deep Hum",
    "zen.sound.deepHum.description": "Low grounding tone",
    "narration.title": "Your patterns, in plain words",
    "narration.explain": "Explain this to me",
    "narration.stop": "Stop",
    "narration.dismiss": "Dismiss",
    "narration.generatingAria": "Generating explanation",
    "narration.offline": "The personalized explanation needs a live AI key. The data-driven insights above already say a lot. Add GEMINI_API_KEY to the server to turn it on.",
    "narration.detailedAnalysisTitle": "Detailed pattern analysis",
    "narration.detailedAnalysisDesc": "A closer look at your health logs",
    "narration.patternBody": "Your patterns show a strong correlation between sleep quality and pain levels the following morning.",
    "narration.aiObservationLabel": "AI Observation",
    "narration.aiObservationText": "Flare-ups typically occur 24-48 hours after high-stress events.",
    "narration.missingLogsFallback": "Log at least 5 days of pain and symptoms to get a personalized narration of your patterns.",
    "reflection.button": "Reflect with AI",
    "reflection.stop": "Stop reflection",
    "reflection.generatingAria": "Reflecting on your note",
    "reflection.resultLabel": "A gentle reflection",
    "reflection.dismissAria": "Dismiss reflection",
    "reflection.offline": "AI reflection needs a live key. Your note is saved and stays private on this device.",
    "companion.openAria": "Open AI Care Companion",
    "companion.dialogAria": "AI Care Companion chat",
    "companion.title": "AI Care Companion",
    "companion.waking": "Waking up…",
    "companion.offlineBadge": "Offline · add an AI key to chat live",
    "companion.liveSimulated": "Live · simulated ({provider})",
    "companion.livePowered": "Live · powered by {provider}",
    "companion.closeAria": "Close chat",
    "companion.hello": "I'm here with you. Ask me anything about managing fibromyalgia day to day. I already know your recent logs.",
    "companion.suggestion1": "What helps most during a flare-up?",
    "companion.suggestion2": "Any patterns in my logs this week?",
    "companion.suggestion3": "Help me plan a gentle, low-energy day",
    "companion.offlinePaused": "Chat is paused while the AI is offline.",
    "companion.chatFormAria": "Chat with AI companion",
    "companion.inputLabel": "Message the AI care companion",
    "companion.inputPlaceholder": "How are you feeling right now?",
    "companion.checkedData": "Checked your latest data",
    "companion.errorDefault": "Something went wrong. Please try again.",
    "companion.responding": "The companion is responding.",
    "companion.sendAria": "Send message",
    "companion.stopAria": "Stop generating",
    "companion.offlineHint": "The companion is resting. Set GEMINI_API_KEY (or another provider key) in your server environment to wake it up.",
    "companion.mockHint": "Mock mode is on, so replies are simulated locally. Add a real GEMINI_API_KEY and restart the dev server for live AI.",
    "logs.pageTitle": "Health Logs",
    "logs.pageSubtitle": "Review, filter and manage your check-in history.",
    "logs.summaryAria": "Log summary",
    "logs.stat.totalEntries": "Total entries",
    "logs.stat.avgPain": "Average pain",
    "logs.stat.flareDays": "Flare days",
    "logs.stat.totalHint": "logged check-ins",
    "logs.stat.avgHint": "across all entries",
    "logs.stat.flareHint": "pain level 7+",
    "logs.empty.title": "No logs found",
    "logs.empty.description": "Start tracking your pain levels on the dashboard and your history will appear here.",
    "logs.empty.cta": "Go to Dashboard",
    "logs.tableTitle": "Pain Log History",
    "logs.showing": "Showing {shown} of {total} entries.",
    "logs.searchPlaceholder": "Search mood or notes",
    "logs.searchAria": "Search logs by mood or notes",
    "logs.clearAria": "Clear search",
    "logs.filterLabel": "Filter by pain severity",
    "logs.col.date": "Date",
    "logs.col.pain": "Pain Level",
    "logs.col.mood": "Mood",
    "logs.col.notes": "Notes",
    "logs.col.action": "Action",
    "logs.noMatch.title": "No matching logs",
    "logs.noMatch.description": "Try a different severity or clear your search.",
    "logs.clearFilters": "Clear filters",
    "logs.noNotes": "No notes",
    "logs.confirm": "Confirm?",
    "logs.confirmDeleteAria": "Confirm delete log from {date}",
    "logs.deleteAria": "Delete log from {date}",
    "logs.severity.all": "All",
    "logs.severity.low": "Low",
    "logs.severity.moderate": "Moderate",
    "logs.severity.severe": "Severe",
    "logs.painAria": "Pain level {level}",
    "profile.pageTitle": "User Profile",
    "profile.pageSubtitle": "Manage your account details and track your progress.",
    "profile.loading": "Loading profile...",
    "profile.streakLabel": "Streak",
    "profile.days": "{count} Days",
    "profile.totalLogsLabel": "Total Logs",
    "profile.accountTitle": "Account Settings",
    "profile.accountDescription": "Customize how your name appears in the app.",
    "profile.displayNameLabel": "Display Name",
    "profile.displayNamePlaceholder": "Your Name",
    "profile.saving": "Saving...",
    "profile.saveChanges": "Save Changes",
    "profile.nameUpdated": "Name updated successfully!",
    "profile.updateFailed": "Failed to update profile",
    "profile.updateError": "Something went wrong while saving your profile.",
    "profile.motionTitle": "Motion & Comfort",
    "profile.motionDescription": "Reduce or disable on-screen motion if it feels overwhelming.",
    "profile.gentleMotion": "Gentle Motion",
    "profile.motionOn": "Cards gently float, tilt, and animate as you interact.",
    "profile.motionOff": "Motion is turned off for a calmer, steadier experience.",
    "profile.biometricTitle": "Biometric Unlock",
    "profile.biometricEnable": "Enable Biometric Unlock",
    "profile.biometricEnabled": "Biometric unlock enabled.",
    "profile.biometricDisable": "Disable Biometric Unlock",
    "profile.biometricUnsupported": "Biometric unlock is not supported on this device or browser.",
    "video.tab": "Guided video",
    "video.loading": "Loading guide…",
    "video.badge": "Guide",
    "video.openExternal": "Open the guided video in a new tab",
    "video.unavailable": "The video guide is unavailable right now, so here are the steps instead.",
    "dashboard.section.today": "Today",
    "dashboard.section.core": "Core tools",
    "dashboard.section.insights": "Insights & gentle support",
    "dashboard.toolkitCard.title": "Somatic Toolkit & Exercises (حقيبة العناية والتمارين)",
    "dashboard.toolkitCard.desc": "Gentle exercises matched to today's energy, calming offline audio, breathing guides, sleep & HRV, and medication safety.",
    "dashboard.toolkitCard.cta": "Open the Somatic Toolkit",
    "toolkit.title": "Care Toolkit",
    "toolkit.subtitle": "Movement, sleep, medication safety, and community insights. All of it works offline.",
    "medications.title": "Medications & Safety",
    "medications.subtitle": "Track your regimen and screen it for common fibromyalgia interactions.",
    "medications.namePlaceholder": "Medication or supplement",
    "medications.dosePlaceholder": "Dose",
    "medications.timingLabel": "Timing",
    "medications.timing.morning": "Morning",
    "medications.timing.evening": "Evening",
    "medications.timing.bedtime": "Bedtime",
    "medications.add": "Add",
    "medications.remove": "Remove",
    "medications.empty": "No medications added yet. Start by adding one below.",
    "medications.alerts": "Interaction alerts",
    "medications.severity.critical": "Critical",
    "medications.severity.warning": "Warning",
    "medications.severity.caution": "Caution",
    "medications.defaultDose": "as prescribed",
    "medications.disclaimer": "This is a screening aid only. Always confirm interactions with your pharmacist or care team.",
    "somatic.title": "Movement & Flare Toolkit",
    "somatic.subtitle": "Somatic exercises, calming audio, and breathing, matched to your energy budget (ميزانية الطاقة) today.",
    "somatic.painToday": "Pain today",
    "somatic.spoonsLeft": "Spoons left",
    "somatic.start": "Start",
    "somatic.stop": "Stop",
    "somatic.noneSuitable": "Rest is the exercise today. Nothing suits this pain level.",
    "somatic.ex.breathing.title": "Diaphragmatic breathing",
    "somatic.ex.breathing.desc": "Slow belly breathing to calm the nervous system.",
    "somatic.ex.humming.title": "Vagus nerve humming",
    "somatic.ex.humming.desc": "Gentle humming to stimulate the vagus nerve.",
    "somatic.ex.eyes.title": "Slow eye-movement calm",
    "somatic.ex.eyes.desc": "Slow side-to-side gaze to down-shift arousal.",
    "somatic.ex.neck.title": "Neck micro-releases",
    "somatic.ex.neck.desc": "Tiny, pain-free neck movements at your own pace.",
    "somatic.ex.shoulders.title": "Shoulder circles",
    "somatic.ex.shoulders.desc": "Small, slow circles to release the shoulder girdle.",
    "somatic.ex.catcow.title": "Cat-cow",
    "somatic.ex.catcow.desc": "Spine flexion cycles, only within comfort.",
    "somatic.ex.legs.title": "Legs up the wall",
    "somatic.ex.legs.desc": "Restorative inversion; drain and settle.",
    "somatic.ex.bodyscan.title": "Guided body scan",
    "somatic.ex.bodyscan.desc": "Progressive attention from head to toes.",
    "somatic.audio.title": "Flare emergency audio",
    "somatic.audio.binaural432": "Binaural 432 Hz",
    "somatic.audio.binaural528": "Binaural 528 Hz",
    "somatic.audio.brown": "Deep brown noise",
    "somatic.audio.headphonesNote": "Use headphones for binaural beats. Works fully offline.",
    "somatic.breathing.title": "4-7-8 breathing",
    "somatic.breathing.inhale": "Inhale",
    "somatic.breathing.hold": "Hold",
    "somatic.breathing.exhale": "Exhale",
    "somatic.breathing.idle": "Ready when you are",
    "somatic.breathing.idleHint": "tap start to begin",
    "somatic.breathing.cycle": "cycle",
    "sleep.title": "Sleep Architecture & HRV",
    "sleep.subtitle": "Screen for non-restorative sleep patterns and plan around fibro fog.",
    "sleep.hours": "Hours slept",
    "sleep.awakenings": "Awakenings",
    "sleep.restLabel": "How rested do you feel?",
    "sleep.rest.1": "Exhausted",
    "sleep.rest.2": "Poorly rested",
    "sleep.rest.3": "Okay",
    "sleep.rest.4": "Well rested",
    "sleep.rest.5": "Fully refreshed",
    "sleep.syncWearable": "Sync wearable",
    "sleep.deep": "Deep sleep",
    "sleep.hrv": "HRV",
    "sleep.restingHr": "Resting HR",
    "sleep.alphaDelta": "Alpha-delta intrusion screen",
    "sleep.alphaDelta.likely": "Pattern likely: sleep looks non-restorative",
    "sleep.alphaDelta.possible": "Possible pattern. Keep tracking",
    "sleep.alphaDelta.unlikely": "Pattern unlikely",
    "sleep.alphaDelta.insufficient-data": "Not enough data yet",
    "sleep.deepStatus": "Deep sleep",
    "sleep.deep.low": "Low",
    "sleep.deep.normal": "Normal",
    "sleep.deep.high": "High",
    "sleep.deep.unknown": "Unknown",
    "sleep.fogRisk": "Fibro fog risk today",
    "sleep.fogLevel.low": "Low",
    "sleep.fogLevel.moderate": "Moderate",
    "sleep.fogLevel.high": "High",
    "sleep.disclaimer": "Self-tracking screening only, not a sleep study. Discuss persistent problems with your care team.",
    "communityInsights.title": "Community Insights",
    "communityInsights.subtitle": "Anonymized, region-level trends from the FibroCare community.",
    "communityInsights.region": "Region",
    "communityInsights.trendLead": "{pct}% of users in {region} report increased flare sensitivity right now",
    "communityInsights.dominantTrigger": "Dominant trigger",
    "communityInsights.barometric.falling": "pressure falling",
    "communityInsights.barometric.steady": "pressure steady",
    "communityInsights.barometric.rising": "pressure rising",
    "communityInsights.reportingUsers": "{count} reporting users",
    "communityInsights.leaderboard": "Top coping strategies (community-voted)",
    "communityInsights.votes": "{count} votes",
    "communityInsights.disclaimer": "Modeled anonymized aggregates. No individual data is ever shown.",
    "triggers.barometricDrop": "barometric pressure drop",
    "triggers.humidity": "humidity",
    "triggers.poorSleep": "poor sleep",
    "triggers.overexertion": "overexertion",
    "triggers.stress": "stress",
    "coping.pacedBreathing": "Paced breathing",
    "coping.warmWaterTherapy": "Warm water therapy",
    "coping.gradedWalking": "Graded walking",
    "coping.sleepHygiene": "Sleep hygiene routine",
    "coping.mindfulness": "Mindfulness practice",
    "coping.heatTherapy": "Heat therapy",
    "coping.taiChi": "Tai chi",
    "profile.motionToggleAria": "Toggle gentle motion",
    "profile.privacyTitle": "Privacy Lock",
    "profile.privacyDescOn": "A 4-digit PIN protects your logs. The app locks automatically when you leave the tab.",
    "profile.privacyDescOff": "Protect your sensitive health data with a 4-digit PIN.",
    "profile.newPinLabel": "New 4-digit PIN",
    "profile.enableLock": "Enable Lock",
    "profile.changePinLabel": "Change PIN",
    "profile.changePinPlaceholder": "New 4-digit PIN",
    "profile.update": "Update",
    "profile.disableLock": "Disable Lock",
    "profile.lockNow": "Lock Now",
    "profile.signinTitle": "Account Sign-in",
    "profile.signinDescription": "Sign in with a social provider to access FibroCare across devices.",
    "profile.signedInAs": "Signed in as {name}",
    "profile.signOut": "Sign out",
    "profile.signInGoogle": "Sign in with Google",
    "profile.signInGithub": "Sign in with GitHub",
    "landing.openMenu": "Open menu",
    "landing.closeMenu": "Close menu",
    "landing.signIn": "Sign in",
    "landing.start": "Start your check-in",
    "landing.benefits.pill.core": "The core",
    "landing.benefits.pill.new": "New",
    "landing.resources.eyebrow": "From the library",
    "landing.resources.heading": "Guides for the days in between.",
    "landing.resources.viewAll": "View all resources",
    "landing.resources.card.category.basics": "Basics",
    "landing.resources.card.category.diagnosis": "Diagnosis",
    "landing.resources.card.category.treatment": "Treatment",
    "landing.resources.card.category.movement": "Movement",
    "landing.resources.card.category.nutrition": "Nutrition",
    "landing.resources.card.category.faq": "FAQ",
    "landing.resources.card.readGuide": "Read the guide",
    "landing.nav.how": "How it works",
    "landing.nav.features": "What you get",
    "landing.nav.stories": "Stories",
    "landing.nav.faq": "FAQ",
    "landing.hero.badge": "Made for life with fibromyalgia",
    "landing.hero.heading": "Your pain is real. Your pace is yours.",
    "landing.hero.subheading": "Daily check-ins that turn invisible symptoms into clear patterns, calmer days, and reports your care team can actually use.",
    "landing.hero.seeHow": "See how it works",
    "landing.hero.checkinTitle": "Today's check-in",
    "landing.hero.done": "Done",
    "landing.hero.pain": "Pain",
    "landing.hero.energy": "Energy",
    "landing.hero.sleep": "Sleep",
    "landing.hero.gentle": "Gentle",
    "landing.hero.low": "Low",
    "landing.hero.sleepValue": "6h",
    "landing.hero.daily": "daily check-in",
    "landing.hero.pdf": "PDF report",
    "landing.hero.doctorReady": "Doctor-ready",
    "landing.hero.minutes": "2 min",
    "landing.hero.mockupSub": "Two minutes, gently recorded.",
    "landing.hero.freeStart": "Free to start",
    "landing.hero.noCard": "No credit card",
    "landing.hero.private": "Private by design",
    "landing.trust.encrypted": "Encrypted & never sold",
    "landing.trust.label": "Trust & privacy commitments",
    "landing.tagline.eyebrow": "The quiet part",
    "landing.tagline.heading": "Your body keeps its own score. FibroCare helps you read it.",
    "landing.tagline.copy": "People living with fibromyalgia are not believed enough: by doctors, by workplaces, sometimes by themselves. FibroCare starts from the opposite place: your experience is the data.",
    "landing.day.title": "A day with fibromyalgia",
    "landing.day.rail": "A day with fibromyalgia",
    "landing.day.scenes": "{count} scenes",
    "landing.day.morning": "Morning",
    "landing.day.midday": "Midday",
    "landing.day.evening": "Evening",
    "landing.day.night": "Night",
    "landing.day.morningHeadline": "You wake up already spent.",
    "landing.day.morningCopy": "The alarm goes off, but your body didn't get the message. The heaviness is there before your feet touch the floor, and it isn't laziness.",
    "landing.day.middayHeadline": "The fog settles in.",
    "landing.day.middayCopy": "Words scatter. The simplest task costs double. You learn to pace the middle of the day, saving the lightest work for the foggiest hours.",
    "landing.day.eveningHeadline": "A flare arrives uninvited.",
    "landing.day.eveningCopy": "Pain moves without an agenda: shoulders, hips, hands. You breathe through it, slowly, because you know this too will pass.",
    "landing.day.nightHeadline": "You made it through.",
    "landing.day.nightCopy": "One more day logged, one more thread of a pattern. Tonight you don't fight the sleep you can't command. You rest.",
    "landing.benefits.heading": "Built for the reality of living with it.",
    "landing.benefits.copy": "Not another tracker for people who feel fine. FibroCare is shaped around the days when fine is not on the menu.",
    "landing.benefits.checkinsTitle": "Two-minute check-ins",
    "landing.benefits.checkinsCopy": "Pain, energy, sleep, mood: logged on gentle sliders in under two minutes, so checking in never becomes one more demand on a hard day.",
    "landing.benefits.patternsTitle": "Patterns you can finally see",
    "landing.benefits.patternsCopy": "Insights connect your flares to sleep, weather, and pace, turning \"why me?\" into \"what I can control.\"",
    "landing.benefits.reportTitle": "A report your doctor can read",
    "landing.benefits.reportCopy": "A clean, one-tap PDF summary of your trends, so your appointment starts from your evidence, not your memory.",
    "landing.benefits.toolsTitle": "Tools for tender days",
    "landing.benefits.toolsCopy": "Breathing exercises, soundscapes, and a gratitude journal live one tap away in the Zen portal: calm when you need it most.",
    "landing.benefits.privacyTitle": "Private by design",
    "landing.benefits.privacyCopy": "Optional PIN lock and a Sensory Mode that calms colors and motion. Your data is encrypted and never sold.",
    "landing.benefits.readyTitle": "Ready when you are.",
    "landing.benefits.readyCopy": "No pressure to be consistent before it works. FibroCare meets you wherever today lands.",
    "landing.how.heading": "Three small things, done gently.",
    "landing.how.step1Title": "Check in daily",
    "landing.how.step1Copy": "Two minutes on gentle sliders: pain, energy, sleep, mood. No forms, no pressure, no judgment.",
    "landing.how.step2Title": "See the pattern",
    "landing.how.step2Copy": "FibroCare connects the dots across your logs, so flares stop feeling random and start looking like something you can plan around.",
    "landing.how.step3Title": "Share what matters",
    "landing.how.step3Copy": "Bring a clear, one-tap PDF summary to your next appointment: your evidence, in a form your care team can use.",
    "landing.testimonials.heading": "In their words.",
    "landing.testimonials.copy": "Real check-ins, real patterns, real conversations with care teams.",
    "landing.testimonials.q1": "For the first time, my doctor saw my pain as a pattern instead of a mystery. I walked into that appointment with months of evidence.",
    "landing.testimonials.q2": "The two-minute check-ins are the only health app I have kept up with. It never makes me feel guilty on the bad days.",
    "landing.testimonials.q3": "Bringing the PDF report to my rheumatologist changed the whole conversation. We finally talked about trends, not anecdotes.",
    "landing.testimonials.amiraName": "Amira H.",
    "landing.testimonials.amiraRole": "Living with fibromyalgia since 2019",
    "landing.testimonials.nourName": "Nour S.",
    "landing.testimonials.nourRole": "Primary school teacher",
    "landing.testimonials.monaName": "Mona K.",
    "landing.testimonials.monaRole": "Designer, diagnosed 2021",
    "landing.faq.heading": "Questions, answered gently.",
    "landing.faq.copy": "If you still have questions, the Resources library has deeper guides on symptoms, treatment, and everyday life with fibromyalgia.",
    "landing.faq.resources": "Explore resources",
    "landing.faq.q1": "Is FibroCare a diagnosis or a doctor?",
    "landing.faq.a1": "No. FibroCare is a companion for tracking and understanding your day-to-day experience. It never diagnoses, treats, or replaces medical care. It helps you show up to your care team with clearer information.",
    "landing.faq.q2": "How long does a check-in take?",
    "landing.faq.a2": "About two minutes. You move gentle sliders for pain, energy, sleep, and mood. There are no text fields to fill unless you want to add a note.",
    "landing.faq.q3": "Will my health data stay private?",
    "landing.faq.a3": "Yes. Your data is encrypted, stored securely, and never sold. You can also set an optional PIN lock and switch on Sensory Mode to reduce on-screen motion and color intensity.",
    "landing.faq.q4": "Can I really bring a report to my doctor?",
    "landing.faq.a4": "Yes. From the Reports area you can generate a clean, one-page PDF summary of your trends: pain patterns, flare frequency, sleep and energy averages, ready to share at your next appointment.",
    "landing.faq.q5": "What if I miss a day?",
    "landing.faq.a5": "Nothing breaks. If you miss days, your patterns just grow a little slower; it doesn't mean you've failed. Log when you can.",
    "landing.faq.q6": "Is it free to start?",
    "landing.faq.a6": "Yes. Signing up and starting your check-ins is free, with no credit card required. You can explore the full daily flow before deciding anything else.",
    "landing.final.heading": "Start where you are. Not where the checklist says.",
    "landing.final.copy": "Two minutes today. A clearer pattern this week. A better conversation with your care team when it matters.",
    "landing.final.free": "Free to start · No credit card · Your data stays yours",
    "landing.marquee.words": "rest pace breathe soften listen notice pause gently",
    "landing.footer.tagline": "A gentle, private companion for living with fibromyalgia. Not a medical device and never a replacement for your care team.",
    "landing.footer.resources": "Resources",
    "landing.footer.product": "Product",
    "landing.footer.about": "About fibromyalgia",
    "landing.footer.diagnosis": "Getting diagnosed",
    "landing.footer.treatment": "Treatment options",
    "landing.footer.exercises": "Gentle movement",
    "landing.footer.nutrition": "Nutrition",
    "landing.footer.faq": "FAQ",
    "landing.footer.privacy": "Privacy policy",
    "landing.footer.terms": "Terms of service",
    "landing.footer.madeWith": "Made with care.",
    "landing.footer.disclaimer": "Not a diagnostic tool. If you are in crisis, reach your local emergency services.",
    "landing.footer.copyright": "© {year} FibroCare.",
    "meta.title": "FibroCare - Empathetic Health Companion",
    "meta.description":
      "A gentle, state-aware space for managing fibromyalgia symptoms, flare-ups, and wellness.",
    "meta.ogTitle": "FibroCare - Your pain is real. Your pace is yours.",
    "meta.ogDescription":
      "Daily check-ins that turn invisible symptoms into clear patterns, calmer days, and reports your care team can actually use.",
    "meta.ogImageAlt": "FibroCare - Your pain is real. Your pace is yours.",
  },
  ar: {
    "nav.dashboard": "اللوحة الرئيسية",
    "nav.healthLogs": "السجلات",
    "nav.resources": "الموارد",
    "nav.profile": "الملف الشخصي",
    "nav.toolkit": "حقيبة العناية",
    "nav.backToDashboard": "العودة للوحة التحكم",
    "nav.language": "اللغة",
    "nav.switchToArabic": "التبديل إلى العربية",
    "nav.switchToEnglish": "التبديل إلى الإنجليزية",
    "header.themeLight": "التبديل إلى الوضع الفاتح",
    "header.themeDark": "التبديل إلى الوضع الداكن",
    "ai.statusLabel": "المساعد الذكي",
    "ai.checking": "جارٍ فحص حالة الذكاء الاصطناعي…",
    "ai.live": "مباشر",
    "ai.mock": "وضع المحاكاة",
    "ai.offline": "غير متصل",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.loading": "جاري التحميل...",
    "common.readMore": "اقرأ المزيد",
    "common.back": "رجوع",
    "resources.title": "موارد الرعاية",
    "resources.subtitle": "استكشف الأدلة والنصائح والمحتوى التعليمي لمساعدتك على إدارة التهاب العضلات الليفية بثقة.",
    "resources.search": "البحث في الموارد...",
    "resources.all": "الكل",
    "resources.about": "عن التهاب العضلات الليفية",
    "resources.diagnosis": "التشخيص",
    "resources.treatment": "العلاج والرعاية الذاتية",
    "resources.nutrition": "التغذية",
    "resources.exercises": "التمارين",
    "resources.faq": "الأسئلة الشائعة",
    "resources.community": "المجتمع",
    "resources.filterAria": "تصفية الموارد حسب الفئة",
    "resources.category.all": "الكل",
    "resources.category.managingFlares": "إدارة النوبات",
    "resources.category.nutritionHydration": "التغذية والترطيب",
    "resources.category.gentleMovement": "حركة لطيفة",
    "resources.category.mentalSupport": "الدعم النفسي",
    "resources.tipsFor": "نصائح عملية لـ {category}.",
    "resources.card.flarePacing.title": "تقنيات تنظيم الجهد",
    "resources.card.flarePacing.description": "تعلّم كيف توازن بين النشاط والراحة لمنع الانتكاسات.",
    "resources.card.flarePacing.tip1": "قسّم المهام إلى أجزاء أصغر يمكن إدارتها.",
    "resources.card.flarePacing.tip2": "اضبط مؤقتًا للأنشطة وخذ استراحة قبل أن تشعر بالتعب.",
    "resources.card.flarePacing.tip3": "أعطِ الأولوية لأهم مهام اليوم.",
    "resources.card.flarePacing.tip4": "استمع إلى إشارات جسمك المبكرة.",
    "resources.card.flareHeat.title": "العلاج بالحرارة اللطيف",
    "resources.card.flareHeat.description": "استخدام الدفء لتخفيف تيبس المفاصل وإرخاء العضلات.",
    "resources.card.flareHeat.tip1": "استخدم كمادات دافئة أو وسادات تدفئة على المناطق المصابة.",
    "resources.card.flareHeat.tip2": "جرّب حمامات دافئة بأملاح إبسوم لتقليل توتر العضلات.",
    "resources.card.flareHeat.tip3": "تأكد ألا تكون مصادر الحرارة ساخنة جدًا لتجنب حروق الجلد.",
    "resources.card.flareHeat.tip4": "طبّق الدفء لمدة 15-20 دقيقة في المرة الواحدة.",
    "resources.card.antiInflammatory.title": "نظام غذائي مضاد للالتهابات",
    "resources.card.antiInflammatory.description": "أطعمة قد تساعد في تقليل الالتهاب وآلام المفاصل.",
    "resources.card.antiInflammatory.tip1": "أدرج أطعمة غنية بأوميغا 3 مثل السلمون والجوز وبذور الكتان.",
    "resources.card.antiInflammatory.tip2": "تناول الكثير من التوت الملون والخضروات الورقية.",
    "resources.card.antiInflammatory.tip3": "قلل السكريات المصنعة والكربوهيدرات المكررة.",
    "resources.card.antiInflammatory.tip4": "جرّب الكركم والزنجبيل لخصائصهما الطبيعية المضادة للالتهاب.",
    "resources.card.hydration.title": "استراتيجيات الترطيب",
    "resources.card.hydration.description": "نصائح للبقاء رطبًا حتى عندما يبدو شرب الماء كواجب شاق.",
    "resources.card.hydration.tip1": "احمل زجاجة ماء قابلة لإعادة الاستخدام معك دائمًا.",
    "resources.card.hydration.tip2": "جرّب ماء منكّهًا بالخيار أو الليمون لمزيد من النكهة.",
    "resources.card.hydration.tip3": "اضبط تذكيرات لشرب الماء طوال اليوم.",
    "resources.card.hydration.tip4": "تناول أطعمة غنية بالماء مثل البطيخ والخيار.",
    "resources.card.stretching.title": "تمطيط لطيف",
    "resources.card.stretching.description": "طرق منخفضة التأثير للحفاظ على المرونة دون إجهاد.",
    "resources.card.stretching.tip1": "ركّز على حركات بطيئة ومنتظمة.",
    "resources.card.stretching.tip2": "لا تتجاوز الألم الحاد أبدًا؛ تمدد فقط حتى شد خفيف.",
    "resources.card.stretching.tip3": "استخدم كرسيًا أو حائطًا للدعم أثناء التمدد.",
    "resources.card.stretching.tip4": "حافظ على التمدد 15-30 ثانية وتنفس بعمق.",
    "resources.card.walking.title": "المشي منخفض التأثير",
    "resources.card.walking.description": "طرق لإدراج المشي في روتينك بأمان.",
    "resources.card.walking.tip1": "ابدأ بمسافات قصيرة جدًا وزدها تدريجيًا.",
    "resources.card.walking.tip2": "امشِ على أسطح مستوية وثابتة لتجنب السقوط.",
    "resources.card.walking.tip3": "ارتدِ أحذية داعمة ومريحة.",
    "resources.card.walking.tip4": "خذ فترات راحة متكررة وامشِ بوتيرة تسمح لك بالتحدث براحة.",
    "resources.card.mindfulness.title": "ممارسات اليقظة الذهنية",
    "resources.card.mindfulness.description": "تهدئة العقل لإدارة الأثر العاطفي للألم بشكل أفضل.",
    "resources.card.mindfulness.tip1": "مارس التنفس البطني العميق 5 دقائق يوميًا.",
    "resources.card.mindfulness.tip2": "جرّب تطبيق تأمل موجه للاسترخاء.",
    "resources.card.mindfulness.tip3": "ركّز كل صباح على أشياء قليلة تشعر بالامتنان تجاهها.",
    "resources.card.mindfulness.tip4": "استخدم تقنيات التمركز: حدد 5 أشياء تراها و4 تلمسها، وهكذا.",
    "resources.card.sleepHygiene.title": "نظافة النوم",
    "resources.card.sleepHygiene.description": "بناء روتين لنوم أعمق وأكثر إفادة.",
    "resources.card.sleepHygiene.tip1": "حافظ على جدول نوم واستيقاظ منتظم.",
    "resources.card.sleepHygiene.tip2": "تجنب الشاشات قبل النوم بساعة على الأقل.",
    "resources.card.sleepHygiene.tip3": "أنشئ طقسًا مهدئًا قبل النوم (مثل شاي الأعشاب أو قراءة خفيفة).",
    "resources.card.sleepHygiene.tip4": "أبقِ غرفة نومك باردة ومظلمة وهادئة.",
    "about.title": "عن التهاب العضلات الليفية",
    "about.subtitle": "فهم حالتك هو الخطوة الأولى نحو إدارة أفضل.",
    "about.overview": "ما هو التهاب العضلات الليفية؟",
    "about.causes": "السبب المحتمل",
    "about.symptoms": "الأعراض الشائعة",
    "about.causesDetail": "السبب الدقيق لالتهاب العضلات الليفية غير مفهوم تمامًا، لكن الباحثين يعتقدون أنه يتضمن عوامل وراثية وبيئية ونفسية. النظريات الرئيسية تشمل:\n\nمعالجة غير طبيعية للألم: الجهاز العصبي المركزي يضخم إشارات الألم، مما يجعلك أكثر حساسية للمنبهات.\n\nالعوامل الوراثية: التهاب العضلات الليفية يميل إلى التواجد في العائلات، مما يشير إلى أن بعض الطفرات الجينية قد تزيد من القابلية.\n\nالصدمات الجسدية أو العاطفية: اضطراب ما بعد الصدمة أو الجراحة أو الاضطراب العاطفي الكبير يمكن أن يُطلق الحالة.\n\nاضطرابات النوم: اضطرابات النوم المزمنة مثل متلازمة الساقين غير الهادئة أو انقطاع النفس أثناء النوم مرتبطة بشكل شائع.\n\nالعدوى: بعض الأمراض تظهر لتشغيل أو تفاقم أعراض التهاب العضلات الليفية.",
    "about.symptomsDetail": "العلامة المميزة لالتهاب العضلات الليفية هي الألم العضلي الهيكلي الواسع، لكن الحالة تؤثر على العديد من أعضاء الجسم:\n\nالألم الواسع: ألم مستمر خافت يستمر ثلاثة أشهر على الأقل، يحدث على جانبي الجسم وفوق وتحن الخصر.\n\nالإرهاق: حتى بعد النوم لفترات طويلة، يستيقظ مرضى التهاب العضلات الليفية متعبين. النوم متقطع بشكل متكرر بسبب الألم.\n\nصعوبات إدراكية (ضباب الألياف): مشاكل في التركيز والانتباه والذاكرة شائعة.\n\nمشاكل النوم: العديد من المرضى يعانون من الأرق أو النوم غير المتجدد.\n\nالصداع والشقيقة: صداع التوتر المتكرر أو الشقيقة.\n\nالتيبس: خاصة عند الاستيقاظ في الصباح.\n\nالحساسية: حساسية مفرطة للضوء والضوضاء ودرجة الحرارة والروائح.\n\nمشاكل الجهاز الهضمي: متلازمة القولون العصبي تحدث بشكل متكرر.",
    "diagnosis.title": "التشخيص",
    "diagnosis.subtitle": "تعرف على كيفية تشخيص التهاب العضلات الليفية وما يمكن توقعه أثناء العملية.",
    "diagnosis.howDiagnosed": "كيف يتم تشخيص التهاب العضلات الليفية؟",
    "diagnosis.tests": "الاختبارات والتقييمات",
    "diagnosis.specialist": "متى ترى أخصائي",
    "diagnosis.criteria": "يتم تشخيص التهاب العضلات الليفية بناءً على الأعراض واستبعاد الحالات الأخرى. معايير الكلية الأمريكية للروماتيزم تشمل:\n\nمؤشر الألم الواسع (WPI) ومقياس شدة الأعراض (SSS)\nالأعراض موجودة لمدة ثلاثة أشهر على الأقل\nلا توجد حالة أخرى تفسر الألم\n\nالأطباء قد يستخدمون أيضًا اختبار نقاط الحساسية، حيث يتم الضغط على مناطق محددة من الجسم لتقييم الحساسية.",
    "diagnosis.exams": "على الرغم من عدم وجود اختبار حاسم واحد لالتهاب العضلات الليفية، قد يطلب طبيبك اختبارات لاستبعاد الحالات الأخرى:\n\nصورة الدم الكاملة (CBC): تتحقق من علامات العدوى أو فقر الدم\nمعدل ترسب الكريات الحمراء (ESR): يقيس مستويات الالتهاب\nاختبارات وظيفة الغدة الدرقية: تستبعد اضطرابات الغدة الدرقية\nمستويات فيتامين D: النقص يمكن أن يحاكي أعراض التهاب العضلات الليفية\nعامل الروماتويد: يستبعد التهاب المفاصل الروماتويدي\nدراسات النوم: تحدد اضطرابات النوم التي قد تساهم في الأعراض\n\nهذه الاختبارات تساعد في التأكد من أن أعراضك ليست بسبب حالة أخرى قابلة للعلاج.",
    "treatment.title": "العلاج والرعاية الذاتية",
    "treatment.subtitle": "نهج شامل يجمع بين العلاج الطبي وتعديل نمط الحياة.",
    "treatment.medications": "الأدوية",
    "treatment.therapy": "العلاج الطبيعي",
    "treatment.exercise": "التمارين الرياضية",
    "treatment.stress": "إدارة التوتر",
    "treatment.sleep": "نظافة النوم",
    "treatment.selfCare": "استراتيجيات الرعاية الذاتية",
    "nutrition.title": "التغذية",
    "nutrition.subtitle": "ما تأكله يمكن أن يؤثر بشكل كبير على أعراض التهاب العضلات الليفية.",
    "nutrition.goodFoods": "الأطعمة المساعدة",
    "nutrition.triggers": "المحفزات الشائعة",
    "nutrition.recipes": "أفكار الوجبات",
    "nutrition.hydration": "الترطيب",
    "exercises.title": "التمارين الرياضية",
    "exercises.subtitle": "الحركة اللطيفة والمنتظمة هي مفتاح إدارة ألم وتيبس التهاب العضلات الليفية.",
    "exercises.stretching": "التمطيط اللطيف",
    "exercises.yoga": "يوجا الاسترخاء",
    "exercises.walking": "المشي منخفض التأثير",
    "exercises.swimming": "التمارين المائية",
    "exercises.tips": "نصائح التمارين",
    "faq.title": "الأسئلة الشائعة",
    "faq.subtitle": "إجابات على الأسئلة الشائعة حول العيش مع التهاب العضلات الليفية.",
    "faq.chronic": "هل التهاب العضلات الليفية حالة مزمنة؟",
    "faq.chronicAnswer": "نعم، يعتبر التهاب العضلات الليفية حالة مزمنة (طويلة الأمد). ومع ذلك، يمكن أن تتأرجح الأعراض بمرور الوقت، مع فترات من الاتفاضات والهدوء. يتعلم العديد من الأشخاص إدارة أعراضهم بفعالية مع خطة العلاج وتعديل نمط الحياة المناسبين.",
    "faq.cure": "هل هناك علاج لالتهاب العضلات الليفية؟",
    "faq.cureAnswer": "حاليًا، لا يوجد علاج معروف لالتهاب العضلات الليفية. ومع ذلك، يمكن لمزيج من الأدوية والعلاج والتمارين وإدارة التوتر وتعديلات نمط الحياة أن يقلل الأعراض بشكل كبير ويحسن جودة الحياة. يستمر البحث المستمر في استكشاف نهج علاج جديدة.",
    "faq.pregnancy": "هل يتأثر التهاب العضلات الليفية بالحمل؟",
    "faq.pregnancyAnswer": "التهاب العضلات الليفية لا يسبب عادة مضاعفات أثناء الحمل، لكن الأعراض قد تتغير. بعض النساء يتحسن خلال الحمل، بينما قد تعاني أخريات من زيادة الألم أو الإرهاق. من المهم العمل مع مقدم الرعاية الصحية لإدارة الأعراض بأمان أثناء الحمل.",
    "faq.exercise": "هل التمارين آمنة مع التهاب العضلات الليفية؟",
    "faq.exerciseAnswer": "نعم، التمارين اللطيفة هي في الواقع واحدة من أكثر العلاجات فعالية لالتهاب العضلات الليفية. الأنشطة منخفضة التأثير مثل المشي والسباحة والتمطيط ويوجا يمكن أن تقلل الألم وتحسن النوم وتعزز المزاج. ابدأ ببطء، واستمع لجسمك، وزد من مستوى النشاط تدريجيًا.",
    "faq.diagnosis": "كم يستغرق التشخيص؟",
    "faq.diagnosisAnswer": "قد يستغرق التشخيص وقتًا لأن أعراض التهاب العضلات الليفية تتداخل مع العديد من الحالات الأخرى. في المتوسط، قد يستغرق الأمر عدة أشهر إلى سنوات من ظهور الأعراض إلى التشخيص. الاحتفاظ بسجل الأعراض و طلب تقييم من أخصائي الروماتيزم يمكن أن يسرع العملية.",
    "faq.treatment": "أيه العلاجات تعمل بشكل أفضل؟",
    "faq.treatmentAnswer": "النهج الأكثر فعالية هو عادة متعدد الوسائط، يجمع بين الأدوية (مثل دولوكسيتين أو برغابالين) والعلاج الطبيعي والتمارين المنتظمة اللطيفة والعلاج السلوكي المعرفي (CBT) وتقنيات إدارة التوتر. ما يعمل بشكل أفضل يختلف من شخص لآخر، لذا العثور على المزيج الصحيح يتطلب غالبًا الصبر والتواصل المفتوح مع فريق الرعاية الصحية.",
    "community.title": "المجتمع",
    "community.subtitle": "مساحة دافئة لمشاركة التجارب والنصائح والدعم مع الآخرين الذين يفهمون.",
    "community.shareStory": "شارك قصتك",
    "community.stories": "قصص المرضى",
    "community.tips": "نصائح الأقران",
    "community.support": "الدعم والتشجيع",
    "community.writePlaceholder": "شارك تجربتك أو نصيحة مفيدة أو كلمات تشجيع...",
    "community.postButton": "مشاركة",
    "community.noStories": "كن أول من يشارك قصتك. تجربتك يمكن أن تساعد شخصًا آخر على الشعور بأقل وحدة.",
    "community.loginPrompt": "سجل الدخول لمشاركة قصتك والتواصل مع الآخرين.",
    "dashboard.greeting.morning": "صباح الخير",
    "dashboard.greeting.afternoon": "مساء الخير",
    "dashboard.greeting.evening": "مساء الخير",
    "dashboard.todayMessage": "خذ لحظة للتواصل مع جسدك اليوم.",
    "dashboard.streakAria": "سلسلة تسجيل {count} يوم",
    "dashboard.streakDays": "أيام متتالية",
    "dashboard.checkin.title": "كيف تشعر اليوم؟",
    "dashboard.checkin.subtitle": "تتبع طاقتك وأعراضك يساعد في إدارة النوبات وتحسين الرعاية.",
    "dashboard.energy.title": "كيف طاقتك اليوم؟",
    "dashboard.energy.goodDay": "يوم جيد",
    "dashboard.energy.lowEnergy": "طاقة منخفضة",
    "dashboard.energy.flareUp": "نوبة",
    "dashboard.symptoms.label": "الأعراض والملاحظات (اختياري)",
    "dashboard.symptoms.placeholder": "كيف تشعر بالتحديد؟ أي محفزات أو أعراض؟",
    "dashboard.save.saving": "جارٍ الحفظ...",
    "dashboard.save.submit": "تسجيل دخول اليوم",
    "dashboard.save.success": "تم تسجيل البيانات بنجاح!",
    "dashboard.support.title": "دعم لطيف",
    "dashboard.support.subtitle": "أدوات سريعة لتهدئة جهازك العصبي ورفع حالتك المزاجية.",
    "dashboard.weekly.title": "التقدم الأسبوعي",
    "dashboard.weekly.subtitle": "مستويات ألمك خلال آخر 7 أيام.",
    "dashboard.weekly.avgPain": "متوسط الألم",
    "dashboard.weekly.daysLogged": "أيام مسجلة",
    "dashboard.weekly.highest": "الأعلى",
    "dashboard.weekly.scale": "/10",
    "dashboard.insights.title": "رؤى الذكاء الاصطناعي",
    "dashboard.insights.subtitle": "أنماط مكتشفة من سجلاتك الأخيرة.",
    "dashboard.insights.empty": "سجّل الألم والأعراض لمدة 5 أيام على الأقل لفتح رؤى مخصصة.",
    "dashboard.toast.message": "يبدو أن اليوم صعب. هل تود التبديل إلى وضع التهدئة وأخذ 3 دقائق لنفسك؟",
    "dashboard.toast.title": "نحن هنا معك",
    "dashboard.toast.dismissAria": "إغلاق الرسالة",
    "dashboard.toast.calming": "وضع التهدئة",
    "dashboard.toast.zen": "بوابة الزن",
    "auth.passwordShow": "إظهار {label}",
    "auth.passwordHide": "إخفاء {label}",
    "common.close": "إغلاق",
    "privacy.unlockDialogAria": "أدخل رمز PIN لفتح FibroCare",
    "privacy.lockedTitle": "مساحتك مقفلة",
    "privacy.enterPin": "أدخل رمز PIN المكوّن من 4 أرقام",
    "privacy.incorrectPin": "رمز PIN غير صحيح. حاول مرة أخرى.",
    "privacy.digitAria": "الرقم {digit}",
    "privacy.deleteDigitAria": "حذف آخر رقم",
    "privacy.digitsEnteredAria": "تم إدخال {length} من {total} أرقام",
    "privacy.forgotPin": "نسيت رمز PIN؟",
    "privacy.useBiometrics": "استخدام البصمة",
    "privacy.biometricScanning": "في انتظار مستشعر البصمة…",
    "pricing.title": "خطط فيبروكير",
    "pricing.subtitle": "سجلاتك وبياناتك مجانية دائمًا. Pro يضيف عمل الذكاء الاصطناعي الأعمق فوقها.",
    "pricing.free.name": "مجاني",
    "pricing.free.price": "$0",
    "pricing.free.perk1": "تسجيل غير محدود للألم والأعراض والملاعق",
    "pricing.free.perk2": "خريطة الجسم ووضع النوبات وأدوات الحركة",
    "pricing.free.perk3": "تثبيت دون اتصال (PWA) مع تشفير محلي",
    "pricing.free.perk4": "ملخص PDF لـ 30/90 يومًا",
    "pricing.pro.badge": "برو",
    "pricing.pro.name": "فيبروكير برو",
    "pricing.pro.price": "$6",
    "pricing.pro.period": "/ شهريًا",
    "pricing.pro.perk1": "رفيق الذكاء الاصطناعي المتعاطف بذاكرة صحتك",
    "pricing.pro.perk2": "الملخص السريري للطبيب وتصدير PDF",
    "pricing.pro.perk3": "متوقع النوبات والطقس بالسلاسل الزمنية",
    "pricing.pro.perk4": "ماجستركلاسات الفيديو الموجّهة",
    "pricing.upgradeCta": "الترقية إلى برو",
    "pricing.comingSoon": "قريبًا",
    "pricing.footnote": "يمكنك الإلغاء في أي وقت. بياناتك الصحية لا تغادر جهازك ما لم تصدّرها بنفسك.",
    "pricing.previewTitle": "هذه ميزة برو",
    "pricing.previewBody": "يمكنك رؤية معاينة هنا. برو يفتح النسخة الكاملة، وسجلاتك تبقى مجانية في كل الأحوال.",
    "profile.pricing": "ترقية الحساب · FibroCare Pro",
    "privacy.security.title": "الخصوصية والأمان",
    "privacy.security.subtitle": "بياناتك الصحية تبقى على جهازك ما لم تصدّرها بنفسك.",
    "privacy.security.encryption": "تشفير البيانات المحلية",
    "privacy.security.encryptionDesc": "الإدخالات المحلية الحساسة تُشفَّر بخوارزمية AES-GCM قبل تخزينها في هذا المتصفح.",
    "privacy.security.active": "مُفعّل",
    "privacy.security.unavailable": "غير متاح",
    "privacy.security.analytics": "إلغاء الاشتراك في التحليلات",
    "privacy.security.analyticsDesc": "لا تعمل أي تحليلات اليوم، ويُحفَظ هذا التفضيل لتخطّاك في أي تحليلات مستقبلية.",
    "privacy.security.export": "تصدير بياناتي",
    "privacy.security.exportDesc": "ينزّل نسخة JSON مشفّرة لكل ما هو مخزّن محليًا. اختر عبارة مرور من 8 أحرف على الأقل؛ لا تغادر هذا الجهاز أبدًا، ولا يمكن قراءة الملف بدونها.",
    "privacy.security.passphrase": "عبارة مرور التصدير (8 أحرف فأكثر)",
    "privacy.security.exportBtn": "تصدير",
    "privacy.security.exportDone": "تم تنزيل التصدير المشفّر. احفظ عبارة المرور؛ لا يمكن استعادتها.",
    "privacy.security.exportError": "فشل التصدير. تأكد أن عبارة المرور 8 أحرف على الأقل.",
    "privacy.security.purge": "محو كل البيانات الصحية المحلية",
    "privacy.security.purgeDesc": "يزيل كل إدخالات FibroCare من هذا المتصفح: الذاكرات المؤقتة والتفضيلات وحالة الجلسة والملفات دون اتصال. تفضيل اللغة وبيانات الخادم لا يتأثران.",
    "privacy.security.purgeBtn": "محو الآن",
    "privacy.security.purgeConfirmTitle": "حذف كل ما خزّنه FibroCare في هذا المتصفح؟",
    "privacy.security.purgeConfirmBody": "لا يمكن التراجع. السجلات والتفضيلات والذاكرات المؤقتة على هذا الجهاز ستُمحى. بيانات حسابك على الخادم تبقى كما هي.",
    "privacy.security.purged": "تمت إزالة {count} عنصرًا محليًا{items}.",
    "privacy.biometricFailed": "فشل الفتح بالبصمة. حاول مرة أخرى.",
    "privacy.resetPinTitle": "إعادة تعيين رمز PIN",
    "privacy.resetPinCloseAria": "إغلاق نافذة إعادة تعيين رمز PIN",
    "privacy.resetPinPrompt": "اختر رمز PIN جديدًا من 4 أرقام لـ {email}.",
    "privacy.resetPinNew": "رمز PIN الجديد",
    "privacy.resetPinConfirm": "تأكيد رمز PIN الجديد",
    "privacy.resetPinAction": "إعادة تعيين الرمز",
    "privacy.resetPinNotSignedIn": "يجب تسجيل الدخول لإعادة تعيين رمز PIN.",
    "privacy.resetPinSignIn": "تسجيل الدخول",
    "privacy.setupDialogAria": "تعيين رمز PIN للخصوصية",
    "privacy.protectTitle": "احمِ بياناتك الصحية",
    "privacy.choosePin": "اختر رمز PIN من 4 أرقام",
    "privacy.confirmPin": "تأكيد رمز PIN",
    "privacy.pinMismatch": "الرموز غير متطابقة. ابدأ من جديد.",
    "quickActions.ariaLabel": "إجراءات سريعة",
    "quickActions.checkin.title": "التسجيل اليومي",
    "quickActions.checkin.description": "سجل طاقتك وألمك وأعراضك",
    "quickActions.logs.title": "سجلات الصحة",
    "quickActions.logs.description": "تصفح سجل تسجيلاتك",
    "quickActions.reports.title": "التقارير الطبية",
    "quickActions.reports.description": "صدّر ملخصًا لفريق الرعاية الخاص بك",
    "quickActions.resources.title": "موارد الرعاية",
    "quickActions.resources.description": "إرشادات لطيفة ونصائح عملية",
    "logging.presets.ariaLabel": "إعدادات التسجيل السريعة",
    "logging.presets.calmDay": "يوم هادئ",
    "logging.presets.mildFlare": "نوبة خفيفة",
    "logging.presets.severeFlare": "نوبة شديدة",
    "logging.symptoms.widespreadPain": "ألم منتشر",
    "logging.symptoms.fatigue": "إرهاق",
    "logging.symptoms.sleepProblems": "مشاكل النوم",
    "logging.symptoms.fibroFog": "ضباب الألياف",
    "logging.symptoms.headache": "صداع / شقيقة",
    "logging.symptoms.tenderPoints": "نقاط حساسة",
    "logging.symptoms.stiffness": "تيبس",
    "logging.symptoms.sensitivity": "حساسية للضوء/الضوضاء",
    "logging.symptoms.selected": "(محدد)",
    "logging.slider.label": "مستوى الألم",
    "logging.slider.ariaLabel": "مستوى الألم",
    "logging.slider.calm": "هادئ",
    "logging.slider.moderate": "متوسط",
    "logging.slider.intense": "شديد",
    "flare.title": "وضع الطوارئ للنوبة",
    "flare.on": "مفعّل",
    "flare.off": "متوقف",
    "flare.activateAria": "تفعيل وضع الطوارئ للنوبة",
    "flare.deactivateAria": "إيقاف وضع الطوارئ للنوبة",
    "flare.dimmedMessage": "الشاشة معتمة والحركة ساكنة. لست وحدك — إليك الأشخاص الذين يمكنهم مساعدتك الآن.",
    "flare.armedDescription": "اضغط لتفعيل عرض مهدئ ومرتب مع موارد الأزمات للنوبات الشديدة.",
    "flare.suggestion": " يبدو أن آخر تسجيل لك هو نوبة — فكر في تفعيل هذا.",
    "flare.crisisOptionsAria": "خيارات الدعم في الأزمات",
    "flare.crisis.emergencyLabel": "في خطر فوري — اتصل بخدمات الطوارئ",
    "flare.crisis.emergencyValue": "911 (أو الرقم المحلي)",
    "flare.crisis.suicideLabel": "دعم الأزمات للولايات المتحدة/كندا",
    "flare.crisis.suicideValue": "988 خط مساعدة الأزمات والانتحار",
    "flare.crisis.samaritansLabel": "ساماريتانز المملكة المتحدة/أيرلندا",
    "flare.crisis.samaritansValue": "116 123 (مجاني، 24/7)",
    "today.title": "سياق اليوم",
    "today.liveWeather": "طقس مباشر · {location}",
    "today.temp": "درجة الحرارة",
    "today.humidity": "الرطوبة",
    "today.pressure": "هيكتو باسكال",
    "today.impact.low": "الضغط المنخفض قد يزيد حساسية الألم",
    "today.impact.high": "الضغط المرتفع قد يسبب الصداع",
    "today.impact.normal": "الضغط ضمن النطاق المريح",
    "today.estimated": "قيم تقريبية (واجهة الطقس غير مهيأة).",
    "recent.title": "السجلات الأخيرة",
    "recent.empty": "لا توجد سجلات بعد. ابدأ التسجيل لترى سجلك هنا.",
    "recent.today": "اليوم",
    "recent.painAria": "مستوى الألم {level}",
    "recent.pain.levelLow": "خفيف",
    "recent.pain.levelMild": "بسيط",
    "recent.pain.levelModerate": "متوسط",
    "recent.pain.levelHigh": "مرتفع",
    "recent.pain.levelSevere": "شديد",
    "quotes.quote1": "جسدك هو بيتك. عامله باللطف الذي يستحقه.",
    "quotes.quote2": "الراحة ليست كسلًا. إنها أساس الشفاء.",
    "quotes.quote3": "كل خطوة صغيرة إلى الأمام هي تقدم. كن لطيفًا مع نفسك.",
    "quotes.quote4": "أنت أكثر من تشخيصك. قوتك هي ما تعرفك.",
    "quotes.quote5": "استمع إلى جسدك اليوم. هو يعرف ما يحتاجه.",
    "quotes.quote6": "الشفاء ليس خطيًا. كل يوم سيئ يعقبه يوم أفضل.",
    "quotes.quote7": "أنت تستحق التعاطف، خاصةً من نفسك.",
    "quotes.quote8": "استنشق الهدوء، وازفر التوتر. أنت آمن في هذه اللحظة.",
    "quotes.quote9": "قيمتك لا تُقاس بإنتاجيتك.",
    "quotes.quote10": "اليوم، اختر السلام على الكمال.",
    "quotes.quote11": "حركة لطيفة، أفكار لطيفة، حديث ذات لطيف.",
    "quotes.quote12": "لقد نجوت من كل يوم صعب حتى الآن. ستنجو من هذا أيضًا.",
    "quotes.author": "فيبروكير",
    "medical.title": "الملخص الطبي الذكي",
    "medical.subtitle": "رؤى رئيسية واتجاهات الألم وأسئلة لطرحها على طبيبك.",
    "medical.generate": "إنشاء الملخص الطبي",
    "medical.analyzing": "جارٍ التحليل…",
    "medical.avgPain": "متوسط الألم",
    "medical.flareDays": "أيام النوبة",
    "medical.logs": "السجلات",
    "medical.painTrend": "اتجاه الألم (آخر 7 أيام)",
    "medical.keyInsights": "رؤى رئيسية",
    "medical.insightsEmpty": "واصل تسجيل الألم والأعراض لمدة 5 أيام على الأقل لفتح رؤى مخصصة.",
    "medical.questions": "أسئلة لطبيبك",
    "medical.question.flare": "سجّلنا {count} يوم نوبات آخر 30 يومًا. هل يمكننا مراجعة ما قد يسببها وتعديل خطتي؟",
    "medical.question.highPain": "متوسط ألمي مرتفع — هل الأدوية والجرعات الحالية لا تزال مناسبة؟",
    "medical.question.fatigue": "الإرهاق ومشاكل النوم تظهر باستمرار في سجلاتي — هل يمكننا استكشاف استراتيجيات الطاقة والنوم؟",
    "medical.question.sensory": "الحساسية الحسية تظهر في أنماطي. هل هناك تغييرات في الوتيرة أو البيئة يمكن أن تقللها؟",
    "medical.question.movement": "ما مستوى الحركة أو العلاج الطبيعي الآمن لي الآن دون تفاقم الأعراض؟",
    "medical.question.tracking": "كيف يمكنني تسجيل أو تدوين بشكل مختلف ليكون مراجعتنا القادمة أكثر فائدة؟",
    "medical.summaryFor": "الملخص الطبي للمريض {name}",
    "medical.generated": "تم الإنشاء في {date}",
    "medical.close": "إغلاق",
    "medical.error": "تعذر إنشاء ملخصك.",
    "medical.generatingAria": "جارٍ إنشاء أسئلة الذكاء الاصطناعي",
    "reports.pageTitle": "التقارير الطبية",
    "reports.pageSubtitle": "ملخّص 90 يومًا من الألم والنوبات والأعراض والأنماط، جاهز لطبيبك المختص.",
    "reports.loading": "جارٍ تحليل بياناتك الصحية…",
    "reports.loadError": "تعذّر تحميل بيانات التقرير.",
    "reports.snapshotAria": "لمحة عن التقرير",
    "reports.stat.avgPain": "متوسط الألم · 90 يومًا",
    "reports.stat.flareDays": "أيام النوبات",
    "reports.stat.topSymptoms": "أبرز الأعراض",
    "reports.stat.noneRecorded": "لا توجد أعراض مسجّلة",
    "reports.insights.subtitle": "ملاحظات مستندة إلى بيانات تسجيلاتك.",
    "reports.insights.empty": "سجّل 5 أيام على الأقل من الألم والأعراض لتفعيل رؤى مخصّصة لك.",
    "reports.insights.filterLabel": "تصفية الرؤى حسب الشدة",
    "reports.insights.none": "لا توجد رؤى بعد. واصل التسجيل بانتظام.",
    "reports.insights.noneFor": "لا توجد رؤى {filter} في الوقت الحالي.",
    "reports.severity.critical": "حرجة",
    "reports.severity.warning": "انتبه",
    "reports.severity.info": "ملاحظة",
    "reports.brief.title": "الملخص التنفيذي السريري بالذكاء الاصطناعي (30 يومًا)",
    "reports.brief.subtitle": "لمحة من صفحة واحدة عن اتجاهاتك، بصياغة سريرية لفريقك الطبي.",
    "reports.brief.flareFrequency": "تكرار الاشتعال",
    "reports.brief.flareDaysUnit": "يوم اشتعال",
    "reports.brief.velocity": "سرعة تغيّر الأعراض",
    "reports.brief.functional": "القدرة الوظيفية",
    "reports.brief.adherence": "التزام بالتسجيل",
    "reports.brief.medications": "أدوية ذكرها المريض",
    "reports.brief.discussion": "نقاط مقترحة للمناقشة",
    "reports.filter.all": "الكل",
    "reports.download.title": "الملخّص السريري PDF",
    "reports.download.description": "يتضمّن مخطط اتجاه الألم لآخر 30 يومًا، وملخّص الارتباطات، والرؤى الرئيسية، وملحق السجلّ الكامل.",
    "reports.download.generating": "جارٍ إنشاء التقرير…",
    "reports.download.button": "تنزيل تقرير PDF",
    "reports.exportError": "تعذّر إنشاء التقرير",
    "careInsight.ariaLabel": "رؤية الرعاية الذكية",
    "careInsight.title": "رؤية الرعاية بالذكاء الاصطناعي",
    "careInsight.flareCalm": "هدوء",
    "careInsight.flareMild": "نوبة خفيفة",
    "careInsight.flareSevere": "نوبة شديدة",
    "careInsight.easing": "تتحسن",
    "careInsight.watch": "راقب",
    "careInsight.title.severeHeat": "يوم نوبة مع حرارة — لِنحمِ هدوءك",
    "careInsight.title.severe": "يوم نوبة — أبقِ دعمك قريبًا",
    "careInsight.title.mildHeat": "انزعاج خفيف مع حرارة — خطوات صغيرة تساعد",
    "careInsight.title.mild": "انزعاج خفيف — رعاية لطيفة تقطع شوطًا طويلًا",
    "careInsight.title.calmHeat": "يوم هادئ وطقس دافئ — حافظ على إيقاعك",
    "careInsight.title.calm": "يوم هادئ ومستقر — اعتني به",
    "careInsight.heat.severe": "يمكن للحرارة والالتهاب أن يجعلان ألم النوبة أصعب في التعامل معه. حافظ على برودة الغرفة وامنح جسمك راحة إضافية.",
    "careInsight.heat.mild": "يمكن للحرارة أن تضخّم الشعور بالألم عند مستواك. البقاء منتعشًا ورطبًا الآن يمكن أن يمنع الانزعاج من التصاعد.",
    "careInsight.heat.calm": "دفء اليوم معتدل بما يكفي لتبقى مرتاحًا — فقط أبقِ الماء قريبًا وتجنّب شمس منتصف النهار.",
    "careInsight.humidity.humidSevere": "يمكن للرطوبة العالية أن تضغط على المفاصل الحساسة. جهاز إزالة الرطوبة أو مروحة في مكانك يمكن أن يجعل الغرفة ألطف.",
    "careInsight.humidity.humid": "الهواء رطب اليوم، وهو ما قد يضيف شعورًا بالثقل. طبقات خفيفة وتدفق هواء يساعدان.",
    "careInsight.humidity.dry": "الهواء الجاف جدًا يمكن أن يهيّج البشرة والجيوب الأنفية. القليل الإضافي من الماء وجهاز ترطيب يحافظان على الراحة.",
    "careInsight.humidity.moderate": "الرطوبة ضمن نطاق مريح اليوم.",
    "careInsight.trend.rising": "كان ألمك يتصاعد بلطف هذا الأسبوع، لذا فإن تنظيم الجهد مهم اليوم أكثر من المعتاد.",
    "careInsight.trend.falling": "كان ألمك يتراجع خلال الأيام الأخيرة — لحظة جيدة لحركة خفيفة ومدروسة.",
    "careInsight.trend.stable": "كان ألمك مستقرًا هذا الأسبوع.",
    "careInsight.suggest.severe.1": "استرح في غرفة باردة منخفضة الإضاءة واقتصر النشاط على المهام الأساسية.",
    "careInsight.suggest.severe.2": "جرّب كمادة باردة على المناطق المتوترة واشرب الماء بانتظام.",
    "careInsight.suggest.severe.3": "فعّل وضع التهدئة لمدة 3 دقائق من التنفس البطيء.",
    "careInsight.suggest.mild.1": "قم بنزهة قصيرة لطيفة أو تمطيط خفيف لتنشيط الدورة الدموية.",
    "careInsight.suggest.mild.2": "أبقِ الماء قريبًا ونظّم المهام مع استراحة قصيرة بينها.",
    "careInsight.suggest.mild.3": "لاحظ كيف يستجيب جسمك ليكون تسجيل الغد أسهل.",
    "careInsight.suggest.calm.1": "حافظ على روتينك اللطيف المعتاد وابقَ رطبًا.",
    "careInsight.suggest.calm.2": "اقضِ بضع دقائق هادئة في الخارج بينما يدعمك الطقس.",
    "careInsight.suggest.calm.3": "واصل التسجيل بانتظام — تصبح الأنماط أوضح كل يوم.",
    "insight.highPainAvg.title": "مستويات ألم مرتفعة",
    "insight.highPainAvg.message": "متوسط ألمك خلال آخر {days} يومًا هو {avg}/10، في النطاق المرتفع. فكّر في مناقشة خطتك الحالية مع فريق الرعاية.",
    "insight.lowPainAvg.title": "الألم مُدار بشكل جيد",
    "insight.lowPainAvg.message": "متوسط ألمك هو {avg}/10. ما تفعله يعمل — واصل عليه.",
    "insight.frequentFlares.title": "نوبات متكررة",
    "insight.frequentFlares.message": "سجّلت {count} أيام بمستوى نوبة (ألم ≥ 7) خلال آخر {days} يومًا. النوبات المتكررة قد تشير إلى الحاجة لمراجعة العلاج.",
    "insight.recurringFlares.title": "أيام نوبات متكررة",
    "insight.recurringFlares.message": "مرّت بك {count} أيام بمستوى نوبة مؤخرًا. غالبًا ما تتبع أنماط النوبات تغيّرات في النوم أو التوتر أو النشاط.",
    "insight.trendWorsening.title": "الألم في ارتفاع",
    "insight.trendWorsening.message": "ارتفع ألمك بمقدار {delta} نقطة بين النصف الأول والثاني من هذه الفترة.",
    "insight.trendImproving.title": "الألم في انخفاض",
    "insight.trendImproving.message": "انخفض ألمك بمقدار {delta} نقطة خلال هذه الفترة. واصل ما يساعدك.",
    "insight.weekdayPattern.title": "نمط أيام الأسبوع",
    "insight.weekdayPattern.message": "يميل {day} ليكون أكثر أيامك صعوبة (متوسط {avg}/10 عبر {count} سجلات). التخطيط لأعمال أخف في ذلك اليوم قد يساعد.",
    "insight.symptomCorrelation.positive.title": "تم رصد رابط بين الأعراض والألم",
    "insight.symptomCorrelation.positive.message": "الأيام التي فيها \"{symptom}\" يزيد الألم بمتوسط {delta} نقطة ({count} مرات). يستحق المتابعة عن قرب.",
    "insight.symptomCorrelation.negative.title": "أعراض تظهر في الأيام الأسهل",
    "insight.symptomCorrelation.negative.message": "يظهر \"{symptom}\" غالبًا في الأيام الأخف (ألم أقل بمقدار {delta} نقطة). قد يكون نتيجة وليس محفزًا.",
    "chart.emptyTitle": "لا توجد إدخالات ألم خلال آخر 7 أيام.",
    "chart.emptyHint": "سجّل تسجيلك أعلاه لبدء تقدمك الأسبوعي.",
    "chart.legendPain": "مستوى الألم",
    "chart.legendAverage": "المتوسط الأسبوعي",
    "chart.summary": "الأعلى {max} من 10، والأدنى {min} من 10.",
    "chart.aria": "التقدم الأسبوعي للألم. {text}",
    "chart.painLevel": "/10",
    "chart.avgLabel": "متوسط {avg}",
    "recovery.sensory.title": "راحة حساسة",
    "recovery.sensory.on": "وضع الحساسية مفعّل: تعتيم الشاشة وإيقاف الحركة.",
    "recovery.sensory.off": "خفت الشاشة وأوقف الحركات للحظات.",
    "recovery.sensory.activate": "تفعيل وضع الحساسية",
    "recovery.sensory.deactivate": "إيقاف وضع الحساسية",
    "recovery.breath.title": "تنفس واعٍ",
    "recovery.breath.description": "جلسة تنفس موجهة من 3 دقائق لتخفيف التوتر.",
    "recovery.breath.openZen": "فتح بوابة الزن",
    "recovery.gratitude.title": "مذكرات الامتنان",
    "recovery.gratitude.description": "اضغط على لحظة أو اكتب لحظتك.",
    "recovery.gratitude.ariaLabel": "مطالبات امتنان سريعة",
    "recovery.gratitude.textareaLabel": "شيء أشعر بالامتنان له",
    "recovery.gratitude.placeholder": "شيء أشعر بالامتنان له...",
    "recovery.gratitude.saveEntry": "حفظ الإدخال",
    "recovery.gratitude.saved": "تم الحفظ ✓",
    "recovery.gratitude.chip1": "لحظة سلام",
    "recovery.gratitude.chip2": "نوم جيد",
    "recovery.gratitude.chip3": "شاي دافئ",
    "spoonTracker.title": "متتبع الملاعق",
    "spoonTracker.subtitle": "ميزانية الطاقة اليومية",
    "spoonTracker.undoAria": "التراجع عن آخر تغيير",
    "spoonTracker.aria": "{current} من {max} ملاعق متبقية",
    "spoonTracker.removeAria": "إزالة ملعقة",
    "spoonTracker.addAria": "إضافة ملعقة",
    "spoonTracker.preset.shower": "استحمام",
    "spoonTracker.preset.walk": "مشية قصيرة",
    "spoonTracker.preset.cooking": "طبخ",
    "spoonTracker.preset.groceries": "مشتريات",
    "spoonTracker.preset.rest": "راحة",
    "spoonTracker.preset.nap": "قيلولة",
    "bodyMap.title": "خريطة الألم",
    "bodyMap.subtitle": "اضغط على المناطق التي تشعر فيها بالألم",
    "bodyMap.emptyHint": "اضغط على منطقة في الجسم لتحديد الألم",
    "bodyMap.point.neck": "الرقبة",
    "bodyMap.point.shoulders": "الكتفان",
    "bodyMap.point.arms": "الذراعان",
    "bodyMap.point.lowerBack": "الظهر السفلي",
    "bodyMap.point.knees": "الركبتان",
    "medication.title": "أدوية اليوم",
    "medication.subtitle": "تتبع جرعاتك",
    "medication.morningSupplement": "مكمل الصباح",
    "medication.painRelief": "مسكن الألم",
    "medication.eveningMag": "مغنيسيوم المساء",
    "medication.taken": "تم تناوله",
    "medication.pending": "معلق",
    "medication.nextDose": "الجرعة القادمة خلال",
    "zen.focusBreath": "ركّز على تنفسك",
    "zen.ultraDark": "داكن جدًا",
    "zen.exitUltraDark": "الخروج من الوضع الداكن",
    "zen.switchCalming": "التبديل إلى وضع الهدوء",
    "zen.breatheIn": "شهيق ({seconds}ث)",
    "zen.breatheOut": "زفير ({seconds}ث)",
    "zen.soundscapeAria": "خلاط الأصوات المحيطة",
    "zen.sound.rain.label": "مطر",
    "zen.sound.rain.description": "مطر ناعم يتساقط",
    "zen.sound.forest.label": "غابة",
    "zen.sound.forest.description": "أجواء غابة عميقة",
    "zen.sound.whiteNoise.label": "ضوضاء بيضاء",
    "zen.sound.whiteNoise.description": "همهمة ثابتة",
    "zen.sound.deepHum.label": "طنين عميق",
    "zen.sound.deepHum.description": "نغمة أرضية منخفضة",
    "narration.title": "أنماطك، بكلمات بسيطة",
    "narration.explain": "اشرح لي هذا",
    "narration.stop": "إيقاف",
    "narration.dismiss": "إغلاق",
    "narration.generatingAria": "جارٍ إنشاء الشرح",
    "narration.offline": "الشرح المخصص يحتاج مفتاح ذكاء اصطناعي مباشر. رؤىك المبنية على البيانات أعلاه تقول الكثير — أضف GEMINI_API_KEY إلى الخادم لفتحه.",
    "narration.detailedAnalysisTitle": "تحليل الأنماط التفصيلي",
    "narration.detailedAnalysisDesc": "رؤى أكثر تفصيلاً بناءً على سجلاتك الصحية",
    "narration.patternBody": "تظهر أنماطك وجود ارتباط قوي بين جودة النوم ومستويات الألم في الصباح التالي.",
    "narration.aiObservationLabel": "ملاحظة الذكاء الاصطناعي",
    "narration.aiObservationText": "عادة ما تحدث نوبات الألم بعد ‎24-48‎ ساعة من الفترات عالية التوتر.",
    "narration.missingLogsFallback": "سجّل الألم والأعراض لمدة 5 أيام على الأقل لفتح شرح مخصص لأنماطك.",
    "reflection.button": "تأمل مع الذكاء الاصطناعي",
    "reflection.stop": "إيقاف التأمل",
    "reflection.generatingAria": "جارٍ التأمل في ملاحظتك",
    "reflection.resultLabel": "تأمل لطيف",
    "reflection.dismissAria": "إغلاق التأمل",
    "reflection.offline": "تأمل الذكاء الاصطناعي يحتاج مفتاحًا مباشرًا — ملاحظتك محفوظة وتبقى خاصة على هذا الجهاز.",
    "companion.openAria": "فتح رفيق الرعاية الذكي",
    "companion.dialogAria": "محادثة رفيق الرعاية الذكي",
    "companion.title": "رفيق الرعاية الذكي",
    "companion.waking": "جارٍ الاستيقاظ…",
    "companion.offlineBadge": "غير متصل · أضف مفتاح ذكاء اصطناعي للدردشة المباشرة",
    "companion.liveSimulated": "مباشر · محاكاة ({provider})",
    "companion.livePowered": "مباشر · مدعوم بـ {provider}",
    "companion.closeAria": "إغلاق الدردشة",
    "companion.hello": "أنا هنا معك. اسألني أي شيء عن إدارة التهاب العضلات الليفية يومًا بيوم — أنا أعرف سجلاتك الأخيرة بالفعل.",
    "companion.suggestion1": "ما الذي يساعد أكثر أثناء النوبة؟",
    "companion.suggestion2": "هل توجد أنماط في سجلاتي هذا الأسبوع؟",
    "companion.suggestion3": "ساعدني في تخطيط يوم لطيف ومنخفض الطاقة",
    "companion.offlinePaused": "الدردشة متوقفة بينما الذكاء الاصطناعي غير متصل.",
    "companion.chatFormAria": "الدردشة مع الرفيق الذكي",
    "companion.inputLabel": "أرسل رسالة لرفيق الرعاية الذكي",
    "companion.inputPlaceholder": "كيف تشعر الآن؟",
    "companion.checkedData": "تم فحص أحدث بياناتك",
    "companion.errorDefault": "حدث خطأ ما. حاول مرة أخرى.",
    "companion.responding": "الرفيق يرد.",
    "companion.sendAria": "إرسال الرسالة",
    "companion.stopAria": "إيقاف التوليد",
    "companion.offlineHint": "الرفيق يستريح. أضف GEMINI_API_KEY (أو مفتاح موفر آخر) في بيئة الخادم لإيقاظه.",
    "companion.mockHint": "وضع المحاكاة مفعّل — الردود محاكاة محليًا. أضف مفتاح GEMINI_API_KEY حقيقي وأعد تشغيل خادم التطوير للحصول على ذكاء اصطناعي مباشر.",
    "logs.pageTitle": "سجلات الصحة",
    "logs.pageSubtitle": "راجع سجل تسجيلاتك وقم بتصفيته وإدارته.",
    "logs.summaryAria": "ملخص السجل",
    "logs.stat.totalEntries": "إجمالي الإدخالات",
    "logs.stat.avgPain": "متوسط الألم",
    "logs.stat.flareDays": "أيام النوبة",
    "logs.stat.totalHint": "تسجيل محسوب",
    "logs.stat.avgHint": "عبر جميع الإدخالات",
    "logs.stat.flareHint": "مستوى ألم 7+",
    "logs.empty.title": "لا توجد سجلات",
    "logs.empty.description": "ابدأ بتتبع مستويات ألمك في لوحة التحكم وستظهر سجلاتك هنا.",
    "logs.empty.cta": "الانتقال إلى لوحة التحكم",
    "logs.tableTitle": "سجل الألم",
    "logs.showing": "عرض {shown} من {total} إدخالات.",
    "logs.searchPlaceholder": "ابحث عن مزاج أو ملاحظات",
    "logs.searchAria": "البحث في السجلات حسب المزاج أو الملاحظات",
    "logs.clearAria": "مسح البحث",
    "logs.filterLabel": "تصفية حسب شدة الألم",
    "logs.col.date": "التاريخ",
    "logs.col.pain": "مستوى الألم",
    "logs.col.mood": "المزاج",
    "logs.col.notes": "الملاحظات",
    "logs.col.action": "إجراء",
    "logs.noMatch.title": "لا توجد سجلات مطابقة",
    "logs.noMatch.description": "جرب شدة مختلفة أو امسح بحثك.",
    "logs.clearFilters": "مسح عوامل التصفية",
    "logs.noNotes": "بدون ملاحظات",
    "logs.confirm": "تأكيد؟",
    "logs.confirmDeleteAria": "تأكيد حذف السجل من {date}",
    "logs.deleteAria": "حذف السجل من {date}",
    "logs.severity.all": "الكل",
    "logs.severity.low": "خفيف",
    "logs.severity.moderate": "متوسط",
    "logs.severity.severe": "شديد",
    "logs.painAria": "مستوى الألم {level}",
    "profile.pageTitle": "الملف الشخصي",
    "profile.pageSubtitle": "أدر تفاصيل حسابك وتابع تقدمك.",
    "profile.loading": "جارٍ تحميل الملف الشخصي...",
    "profile.streakLabel": "السلسلة",
    "profile.days": "{count} أيام",
    "profile.totalLogsLabel": "إجمالي السجلات",
    "profile.accountTitle": "إعدادات الحساب",
    "profile.accountDescription": "خصص كيفية ظهور اسمك في التطبيق.",
    "profile.displayNameLabel": "الاسم المعروض",
    "profile.displayNamePlaceholder": "اسمك",
    "profile.saving": "جارٍ الحفظ...",
    "profile.saveChanges": "حفظ التغييرات",
    "profile.nameUpdated": "تم تحديث الاسم بنجاح!",
    "profile.updateFailed": "فشل تحديث الملف الشخصي",
    "profile.updateError": "حدث خطأ ما أثناء حفظ ملفك الشخصي.",
    "profile.motionTitle": "الحركة والراحة",
    "profile.motionDescription": "قلل أو عطّل الحركة على الشاشة إذا كانت مرهقة.",
    "profile.gentleMotion": "حركة لطيفة",
    "profile.motionOn": "البطاقات تطفو وتنحني وتتحرك بلطف أثناء تفاعلك.",
    "profile.motionOff": "الحركة متوقفة لتجربة أهدأ وأكثر ثباتًا.",
    "profile.biometricTitle": "الفتح بالبصمة",
    "profile.biometricEnable": "تمكين الفتح بالبصمة",
    "profile.biometricEnabled": "تم تمكين الفتح بالبصمة.",
    "profile.biometricDisable": "تعطيل الفتح بالبصمة",
    "profile.biometricUnsupported": "الفتح بالبصمة غير مدعوم على هذا الجهاز أو المتصفح.",
    "video.tab": "فيديو موجّه",
    "video.loading": "جارٍ تحميل الدليل…",
    "video.badge": "دليل",
    "video.openExternal": "افتح الفيديو الموجّه في تبويب جديد",
    "video.unavailable": "الفيديو الموجّه غير متاح الآن — إليك الخطوات بدلًا منه.",
    "dashboard.section.today": "اليوم",
    "dashboard.section.core": "الأدوات الأساسية",
    "dashboard.section.insights": "الرؤى والدعم الهادئ",
    "dashboard.toolkitCard.title": "حقيبة العناية والتمارين السوماتية",
    "dashboard.toolkitCard.desc": "تمارين لطيفة تناسب طاقة اليوم، وصوت مهدّئ دون اتصال، وأدلة تنفس، والنوم وHRV، وسلامة الأدوية.",
    "dashboard.toolkitCard.cta": "فتح حقيبة العناية والتمارين",
    "toolkit.title": "حقيبة العناية",
    "toolkit.subtitle": "حركة ونوم وسلامة الأدوية ورؤى المجتمع — كلها تعمل دون اتصال.",
    "medications.title": "الأدوية والسلامة",
    "medications.subtitle": "تابع أدويتك وافحصها من التداخلات الشائعة في الفيبروميالغيا.",
    "medications.namePlaceholder": "دواء أو مكمّل",
    "medications.dosePlaceholder": "الجرعة",
    "medications.timingLabel": "التوقيت",
    "medications.timing.morning": "صباحًا",
    "medications.timing.evening": "مساءً",
    "medications.timing.bedtime": "قبل النوم",
    "medications.add": "إضافة",
    "medications.remove": "إزالة",
    "medications.empty": "لم تُضف أدوية بعد — ابدأ بإضافة دواء أدناه.",
    "medications.alerts": "تنبيهات التداخل",
    "medications.severity.critical": "خطير",
    "medications.severity.warning": "تحذير",
    "medications.severity.caution": "احتراس",
    "medications.defaultDose": "حسب الوصفة",
    "medications.disclaimer": "أداة فحص أولي فقط — أكّد التداخلات دائمًا مع طبيبك أو الصيدلي.",
    "somatic.title": "أدوات الحركة والنوبات الحادة (ملاذ النوبات الحادة)",
    "somatic.subtitle": "تمارين جسدية وصوت مهدّئ وتنفّس — بما يناسب ميزانية الطاقة اليوم.",
    "somatic.painToday": "الألم اليوم",
    "somatic.spoonsLeft": "الملاعق المتبقية",
    "somatic.start": "ابدأ",
    "somatic.stop": "إيقاف",
    "somatic.noneSuitable": "الراحة هي التمرين اليوم — لا شيء يناسب هذا المستوى من الألم.",
    "somatic.ex.breathing.title": "التنفس الحجابي",
    "somatic.ex.breathing.desc": "تنفس بطيء من البطن لتهدئة الجهاز العصبي.",
    "somatic.ex.humming.title": "الطنين العصب الحائر",
    "somatic.ex.humming.desc": "طنين لطيف لتحفيز العصب الحائر.",
    "somatic.ex.eyes.title": "تهدئة حركة العين",
    "somatic.ex.eyes.desc": "نظرات جانبية بطيئة لخفض التوتر.",
    "somatic.ex.neck.title": "تفريغات الرقبة الدقيقة",
    "somatic.ex.neck.desc": "حركات رقبة صغيرة بلا ألم وبإيقاعك.",
    "somatic.ex.shoulders.title": "دوائر الكتفين",
    "somatic.ex.shoulders.desc": "دوائر صغيرة بطيئة لتفكيك شد الكتف.",
    "somatic.ex.catcow.title": "القط والبقرة",
    "somatic.ex.catcow.desc": "دورات ثني العمود الفقري ضمن الراحة فقط.",
    "somatic.ex.legs.title": "الساقان على الحائط",
    "somatic.ex.legs.desc": "وضعية استشفائية للاسترخاء والتهدئة.",
    "somatic.ex.bodyscan.title": "مسح الجسد الموجّه",
    "somatic.ex.bodyscan.desc": "انتباه متدرج من الرأس إلى القدمين.",
    "somatic.audio.title": "صوت طوارئ النوبات",
    "somatic.audio.binaural432": "نغمات ثنائية 432 هرتز",
    "somatic.audio.binaural528": "نغمات ثنائية 528 هرتز",
    "somatic.audio.brown": "ضجيج بني عميق",
    "somatic.audio.headphonesNote": "استخدم سماعات الرأس للنغمات الثنائية. يعمل دون اتصال تمامًا.",
    "somatic.breathing.title": "تنفس 4-7-8",
    "somatic.breathing.inhale": "شهيق",
    "somatic.breathing.hold": "حبس",
    "somatic.breathing.exhale": "زفير",
    "somatic.breathing.idle": "جاهز متى شئت",
    "somatic.breathing.idleHint": "اضغط ابدأ للانطلاق",
    "somatic.breathing.cycle": "دورة",
    "sleep.title": "بنية النوم ومتغير معدل ضربات القلب",
    "sleep.subtitle": "فحص أنماط النوم غير الاستشفائي والتخطيط حول ضباب الفيبرو.",
    "sleep.hours": "ساعات النوم",
    "sleep.awakenings": "مرات الاستيقاظ",
    "sleep.restLabel": "ما مدى شعورك بالراحة؟",
    "sleep.rest.1": "منهك",
    "sleep.rest.2": "راحة سيئة",
    "sleep.rest.3": "لا بأس",
    "sleep.rest.4": "راحة جيدة",
    "sleep.rest.5": "منتعش تمامًا",
    "sleep.syncWearable": "مزامنة الساعة الذكية",
    "sleep.deep": "النوم العميق",
    "sleep.hrv": "HRV",
    "sleep.restingHr": "نبض الراحة",
    "sleep.alphaDelta": "فحص تسلل ألفا-دلتا",
    "sleep.alphaDelta.likely": "النمط محتمل — يبدو النوم غير استشفائي",
    "sleep.alphaDelta.possible": "نمط ممكن — واصل التتبع",
    "sleep.alphaDelta.unlikely": "النمط غير محتمل",
    "sleep.alphaDelta.insufficient-data": "لا تتوفر بيانات كافية بعد",
    "sleep.deepStatus": "النوم العميق",
    "sleep.deep.low": "منخفض",
    "sleep.deep.normal": "طبيعي",
    "sleep.deep.high": "مرتفع",
    "sleep.deep.unknown": "غير معروف",
    "sleep.fogRisk": "خطر ضباب الفيبرو اليوم",
    "sleep.fogLevel.low": "منخفض",
    "sleep.fogLevel.moderate": "متوسط",
    "sleep.fogLevel.high": "مرتفع",
    "sleep.disclaimer": "فحص تتبع ذاتي فقط — ليس دراسة نوم؛ ناقش المشكلات المستمرة مع فريقك الطبي.",
    "communityInsights.title": "رؤى المجتمع",
    "communityInsights.subtitle": "اتجاهات مجهولة الهوية على مستوى المنطقة من مجتمع FibroCare.",
    "communityInsights.region": "المنطقة",
    "communityInsights.trendLead": "{pct}% من المستخدمين في {region} يبلّغون عن ازدياد حساسية الاشتعال الآن",
    "communityInsights.dominantTrigger": "المحفّز السائد",
    "communityInsights.barometric.falling": "الضغط ينخفض",
    "communityInsights.barometric.steady": "الضغط مستقر",
    "communityInsights.barometric.rising": "الضغط يرتفع",
    "communityInsights.reportingUsers": "{count} مستخدمًا يبلّغون",
    "communityInsights.leaderboard": "أفضل استراتيجيات التأقلم (بتصويت المجتمع)",
    "communityInsights.votes": "{count} صوتًا",
    "communityInsights.disclaimer": "تجميعات مجهولة الهوية نموذجية — لا تُعرض أي بيانات فردية أبدًا.",
    "triggers.barometricDrop": "انخفاض الضغط الجوي",
    "triggers.humidity": "الرطوبة",
    "triggers.poorSleep": "سوء النوم",
    "triggers.overexertion": "الإجهاد المفرط",
    "triggers.stress": "التوتر",
    "coping.pacedBreathing": "التنفس المُتدرّج",
    "coping.warmWaterTherapy": "العلاج بالماء الدافئ",
    "coping.gradedWalking": "المشي المتدرج",
    "coping.sleepHygiene": "روتين نظافة النوم",
    "coping.mindfulness": "ممارسة اليقظة الذهنية",
    "coping.heatTherapy": "العلاج بالحرارة",
    "coping.taiChi": "تاي تشي",
    "profile.motionToggleAria": "تبديل الحركة اللطيفة",
    "profile.privacyTitle": "قفل الخصوصية",
    "profile.privacyDescOn": "رمز PIN من 4 أرقام يحمي سجلاتك. يقفل التطبيق تلقائيًا عند مغادرة التبويب.",
    "profile.privacyDescOff": "احمِ بياناتك الصحية الحساسة برمز PIN من 4 أرقام.",
    "profile.newPinLabel": "رمز PIN جديد من 4 أرقام",
    "profile.enableLock": "تفعيل القفل",
    "profile.changePinLabel": "تغيير رمز PIN",
    "profile.changePinPlaceholder": "رمز PIN جديد من 4 أرقام",
    "profile.update": "تحديث",
    "profile.disableLock": "إيقاف القفل",
    "profile.lockNow": "قفل الآن",
    "profile.signinTitle": "تسجيل الدخول للحساب",
    "profile.signinDescription": "سجّل الدخول بمزود اجتماعي للوصول إلى فيبروكير عبر الأجهزة.",
    "profile.signedInAs": "سجّلت الدخول باسم {name}",
    "profile.signOut": "تسجيل الخروج",
    "profile.signInGoogle": "تسجيل الدخول مع Google",
    "profile.signInGithub": "تسجيل الدخول مع GitHub",
    "landing.openMenu": "فتح القائمة",
    "landing.closeMenu": "إغلاق القائمة",
    "landing.signIn": "تسجيل الدخول",
    "landing.start": "ابدأ تسجيلك اليومي",
    "landing.benefits.pill.core": "الأساس",
    "landing.benefits.pill.new": "جديد",
    "landing.resources.eyebrow": "من المكتبة",
    "landing.resources.heading": "أدلة للأيام التي تتخلل النوبات.",
    "landing.resources.viewAll": "عرض جميع الموارد",
    "landing.resources.card.category.basics": "الأساسيات",
    "landing.resources.card.category.diagnosis": "التشخيص",
    "landing.resources.card.category.treatment": "العلاج",
    "landing.resources.card.category.movement": "الحركة",
    "landing.resources.card.category.nutrition": "التغذية",
    "landing.resources.card.category.faq": "الأسئلة الشائعة",
    "landing.resources.card.readGuide": "اقرأ الدليل",
    "landing.nav.how": "كيف يعمل",
    "landing.nav.features": "ما الذي تحصل عليه",
    "landing.nav.stories": "قصص",
    "landing.nav.faq": "الأسئلة الشائعة",
    "landing.hero.badge": "صُمِّم للحياة مع الفيبروميالجيا",
    "landing.hero.heading": "ألمُك حقيقي. وإيقاعُك ملكُك.",
    "landing.hero.subheading": "تسجيلات يومية تحوّل الأعراض الخفية إلى أنماط واضحة، وأيام أكثر هدوءًا، وتقارير يفيد بها فريق رعايتك فعلًا.",
    "landing.hero.seeHow": "شاهد كيف يعمل",
    "landing.hero.checkinTitle": "تسجيل اليوم",
    "landing.hero.done": "تم",
    "landing.hero.pain": "الألم",
    "landing.hero.energy": "الطاقة",
    "landing.hero.sleep": "النوم",
    "landing.hero.gentle": "خفيف",
    "landing.hero.low": "منخفض",
    "landing.hero.sleepValue": "6س",
    "landing.hero.daily": "تسجيل يومي",
    "landing.hero.pdf": "تقرير PDF",
    "landing.hero.doctorReady": "جاهز للطبيب",
    "landing.hero.minutes": "دقيقتان",
    "landing.hero.mockupSub": "دقيقتان، تُسجَّلان بلطف.",
    "landing.hero.freeStart": "ابدأ مجانًا",
    "landing.hero.noCard": "بدون بطاقة ائتمان",
    "landing.hero.private": "خصوصيتك مصانة",
    "landing.trust.encrypted": "مشفّر ولا يُشارك أبدًا",
    "landing.trust.label": "التزامات الثقة والخصوصية",
    "landing.tagline.eyebrow": "الجزء الهادئ",
    "landing.tagline.heading": "جسدُك يسجِّل ما يتعرض له. فيبروكير يساعدك على قراءته.",
    "landing.tagline.copy": "تجربة الأشخاص المصابين بالفيبروميالجيا لا تُصدَّق بما يكفي: من الأطباء، ومن أماكن العمل، وأحيانًا من أنفسهم. فيبروكير يبدأ من الجهة المعاكسة: تجربتك هي البيانات.",
    "landing.day.title": "يوم مع الفيبروميالجيا",
    "landing.day.rail": "يوم مع الفيبروميالجيا",
    "landing.day.scenes": "{count} مشاهد",
    "landing.day.morning": "صباحًا",
    "landing.day.midday": "منتصف النهار",
    "landing.day.evening": "مساءً",
    "landing.day.night": "ليلًا",
    "landing.day.morningHeadline": "تستيقظ وقد استنفدت طاقتك.",
    "landing.day.morningCopy": "ينطلق المنبه، لكن جسدك لم يبلغه التنبيه. الثقل موجود قبل أن تلمس قدماك الأرض، وهو ليس كسلًا.",
    "landing.day.middayHeadline": "يُطبِق الضباب.",
    "landing.day.middayCopy": "تتبعثر الكلمات. أبسط مهمة تكلفك ضعف الجهد. تتعلم أن تتريّث في منتصف اليوم، مُبقِيًا أخف المهام لأشد الساعات ضبابًا.",
    "landing.day.eveningHeadline": "تأتي النوبة دون دعوة.",
    "landing.day.eveningCopy": "يتحرك الألم دون جدول أعمال: الكتفان، والوركان، واليدان. تتنفس بهدوء وتريّث، لأنك تعلم أن هذا سيمرّ أيضًا.",
    "landing.day.nightHeadline": "لقد اجتزت اليوم.",
    "landing.day.nightCopy": "يوم آخر سُجِّل، وخيط آخر من النمط. الليلة لا تقاتل نومًا لا تملكه. ترتاح.",
    "landing.benefits.heading": "مصمَّم لواقع العيش معه.",
    "landing.benefits.copy": "ليس مجرد متتبع آخر لمن يشعرون بحالة جيدة. فيبروكير مبني حول الأيام التي لا يكون فيها «جيد» على القائمة.",
    "landing.benefits.checkinsTitle": "تسجيلات من دقيقتين",
    "landing.benefits.checkinsCopy": "الألم والطاقة والنوم والمزاج: تُسجَّل على أشرطة لطيفة في أقل من دقيقتين، فلا يصبح التسجيل عبئًا إضافيًا في يوم صعب.",
    "landing.benefits.patternsTitle": "أنماط تراها أخيرًا",
    "landing.benefits.patternsCopy": "تربط الرؤى نوباتك بالنوم والطقس والإيقاع، فتحوّل «لماذا أنا؟» إلى «ما الذي أستطيع التحكم به».",
    "landing.benefits.reportTitle": "تقرير يمكن لطبيبك قراءته",
    "landing.benefits.reportCopy": "ملخص PDF نظيف بنقرة واحدة لاتجاهاتك، فيبدأ موعدك من أدلتك لا من ذاكرتك.",
    "landing.benefits.toolsTitle": "أدوات للأيام الحسّاسة",
    "landing.benefits.toolsCopy": "تمارين التنفس، ومقاطع صوتية، ومذكرة امتنان على بُعد نقرة واحدة داخل بوابة الزين: هدوء عندما تحتاجه أكثر.",
    "landing.benefits.privacyTitle": "خصوصية بالتصميم",
    "landing.benefits.privacyCopy": "قفل PIN اختياري ووضع حسي يخفّف الألوان والحركة. بياناتك مشفَّرة ولا تُباع أبدًا.",
    "landing.benefits.readyTitle": "جاهز متى كنتَ.",
    "landing.benefits.readyCopy": "لا ضغط لتصبح منتظمًا قبل أن ينجح. فيبروكير يقابلك أينما حلّ يومك.",
    "landing.how.heading": "ثلاثة أمور صغيرة، بكل لطف.",
    "landing.how.step1Title": "سجّل يوميًا",
    "landing.how.step1Copy": "دقيقتان على أشرطة لطيفة: الألم، والطاقة، والنوم، والمزاج. لا نماذج، لا ضغط، لا أحكام.",
    "landing.how.step2Title": "لاحظ النمط",
    "landing.how.step2Copy": "يربط فيبروكير الخيوط عبر تسجيلاتك، فتتوقف النوبات عن أن تبدو عشوائية وتبدأ في الظهور كشيء يمكنك التخطيط حوله.",
    "landing.how.step3Title": "شارك ما يهم",
    "landing.how.step3Copy": "احضر بملخص PDF واضح بنقرة واحدة إلى موعدك القادم: أدلتك، في شكل يستخدمه فريق رعايتك.",
    "landing.testimonials.heading": "بكلماتهم.",
    "landing.testimonials.copy": "تسجيلات حقيقية، أنماط حقيقية، محادثات حقيقية مع فرق الرعاية.",
    "landing.testimonials.q1": "لأول مرة، رأى طبيبي ألمي بوصفه نمطًا لا لغزًا. دخلت ذاك الموعد بأشهر من الأدلة.",
    "landing.testimonials.q2": "التسجيلات القصيرة هي تطبيق الصحة الوحيد الذي واظبتُ عليه. لا يجعلني أشعر بالذنب في الأيام الصعبة.",
    "landing.testimonials.q3": "أخذُ تقرير PDF إلى طبيبة الروماتيزم غيّر المحادثة كلّها. تحدثنا أخيرًا عن الاتجاهات، لا عن الحكايات.",
    "landing.testimonials.amiraName": "أميرة ح.",
    "landing.testimonials.amiraRole": "تعيش مع الفيبروميالجيا منذ 2019",
    "landing.testimonials.nourName": "نور س.",
    "landing.testimonials.nourRole": "معلمة في مدرسة ابتدائية",
    "landing.testimonials.monaName": "منى ك.",
    "landing.testimonials.monaRole": "مصممة، شُخِّصت عام 2021",
    "landing.faq.heading": "أسئلة تُجاب بلطف.",
    "landing.faq.copy": "إذا كانت لديك أسئلة أخرى، فمكتبة الموارد تحتوي على أدلة أعمق حول الأعراض والعلاج والحياة اليومية مع الفيبروميالجيا.",
    "landing.faq.resources": "استكشف الموارد",
    "landing.faq.q1": "هل فيبروكير تشخيص أم طبيب؟",
    "landing.faq.a1": "لا. فيبروكير رفيق لتتبع تجربتك اليومية وفهمها. لا يشخّص ولا يعالج ولا يستبدل الرعاية الطبية. يساعدك على الوصول إلى فريق رعايتك بمعلومات أوضح.",
    "landing.faq.q2": "كم يستغرق التسجيل؟",
    "landing.faq.a2": "حوالي دقيقتين. تُحرّك أشرطة لطيفة للألم والطاقة والنوم والمزاج. لا توجد حقول نصية تملؤها إلا إذا أردت إضافة ملاحظة.",
    "landing.faq.q3": "هل تبقى بياناتي الصحية خاصة؟",
    "landing.faq.a3": "نعم. بياناتك مشفَّرة ومخزَّنة بأمان ولا تُباع أبدًا. يمكنك أيضًا ضبط قفل PIN اختياري وتفعيل الوضع الحسي لتخفيف الحركة وشدة الألوان على الشاشة.",
    "landing.faq.q4": "هل يمكنني فعلًا أخذ تقرير إلى طبيبي؟",
    "landing.faq.a4": "نعم. من منطقة التقارير يمكنك إنشاء ملخص PDF نظيف من صفحة واحدة لاتجاهاتك: أنماط الألم، وتكرار النوبات، ومتوسطات النوم والطاقة، جاهزًا للمشاركة في موعدك القادم.",
    "landing.faq.q5": "ماذا لو غيّبت يومًا؟",
    "landing.faq.a5": "لا شيء ينكسر. فيبروكير مصمَّم ليقابلك أينما كنت. غياب الأيام يعني فقط أن أنماطك تنمو ببطء أكبر قليلًا، لا أنك فشلت. الانتظام إيقاع، لا سلسلة.",
    "landing.faq.q6": "هل البدء مجاني؟",
    "landing.faq.a6": "نعم. التسجيل وبدء تسجيلاتك اليومية مجاني تمامًا دون بطاقة ائتمان. يمكنك استكشاف التدفق اليومي كاملًا قبل أي قرار آخر.",
    "landing.final.heading": "ابدأ من حيث أنت. لا من حيث القائمة.",
    "landing.final.copy": "دقيقتان اليوم. نمط أوضح هذا الأسبوع. محادثة أفضل مع فريق رعايتك عندما يلزم.",
    "landing.final.free": "مجاني للبدء · لا بطاقة ائتمان · بياناتك تبقى ملكك",
    "landing.marquee.words": "راحة إيقاع تنفّس ليونة أنصت لاحظ توقّف برفق",
    "landing.footer.tagline": "رفيق لطيف وخاص للحياة مع الفيبروميالجيا. ليس جهازًا طبيًا ولا بديلًا أبدًا عن فريق رعايتك.",
    "landing.footer.resources": "الموارد",
    "landing.footer.product": "المنتج",
    "landing.footer.about": "عن الفيبروميالجيا",
    "landing.footer.diagnosis": "الحصول على التشخيص",
    "landing.footer.treatment": "خيارات العلاج",
    "landing.footer.exercises": "حركة لطيفة",
    "landing.footer.nutrition": "التغذية",
    "landing.footer.faq": "الأسئلة الشائعة",
    "landing.footer.privacy": "سياسة الخصوصية",
    "landing.footer.terms": "شروط الخدمة",
    "landing.footer.madeWith": "صُنع بعناية.",
    "landing.footer.disclaimer": "ليست أداة تشخيص. إذا كنت في أزمة، تواصل مع خدمات الطوارئ المحلية.",
    "landing.footer.copyright": "© {year} فيبروكير.",
    "meta.title": "فيبروكير - رفيق الصحة المتعاطف",
    "meta.description":
      "مساحة لطيفة وواعية بحالتك لإدارة أعراض الفيبروميالجيا، نوبات الألم، والعافية.",
    "meta.ogTitle": "فيبروكير - ألمُك حقيقي. وإيقاعُك ملكُك.",
    "meta.ogDescription":
      "تسجيلات يومية تحوّل الأعراض الخفية إلى أنماط واضحة، وأيام أكثر هدوءًا، وتقارير يفيد بها فريق رعايتك فعلًا.",
    "meta.ogImageAlt": "فيبروكير - ألمُك حقيقي. وإيقاعُك ملكُك.",
  },
};