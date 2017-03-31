//
//  AppDelegate.swift
//  WhoPooping
//
//  Created by Mike Kavouras on 3/29/17.
//  Copyright © 2017 Mike Kavouras. All rights reserved.
//

import Cocoa

enum BathroomStatus: String {
    case occupied = "NO"
    case vacant = "YES"
    case unknown
}

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate, NSMenuDelegate {

    private let statusItem = NSStatusBar.system().statusItem(withLength: -2)
    private var timer: Timer?
    
    var isUrgent = false {
        didSet {
            if isUrgent {
                timer = Timer(timeInterval: 0.2, target: self, selector: #selector(showCrazyIcon), userInfo: nil, repeats: true)
                RunLoop.current.add(timer!, forMode: .defaultRunLoopMode)
                statusItem.menu?.items.first?.title = "😳"
            } else {
                timer?.invalidate()
                timer = nil
                updateIcon()
            }
        }
    }
    
    private var status: BathroomStatus = .unknown {
        willSet {
            statusItem.menu?.items.first?.isHidden = status != .occupied
            
            let oldStatus = status
            let newStatus = newValue
            let wasOccupied = oldStatus == .occupied
            let isVacant = newStatus == .vacant
            
            if isUrgent && wasOccupied && isVacant {
                displayNotification()
                isUrgent = false
            }
        }
        
        didSet {
            if !isUrgent {
                updateIcon()
            }
        }
    }

    func applicationDidFinishLaunching(_ aNotification: Notification) {
        setup()
        
        fetchAndUpdateStatus()
    }
    
    private func setup() {
        setupFetchTimer()
        setupMenu()
    }
    
    private func setupFetchTimer() {
        let timer = Timer(timeInterval: 3.0, target: self, selector: #selector(fetchAndUpdateStatus), userInfo: nil, repeats: true)
        RunLoop.current.add(timer, forMode: .commonModes)
    }
    
    private func setupMenu() {
        let menu = NSMenu()
        menu.addItem(NSMenuItem(title: "😳", action: #selector(firstMenuItemSelected(_:)), keyEquivalent: ""))
        menu.addItem(NSMenuItem.separator())
        menu.addItem(NSMenuItem(title: "Quit", action: #selector(quit(_:)), keyEquivalent: "q"))
        menu.autoenablesItems = false
        
        statusItem.menu = menu
        
        menu.delegate = self
    }
    
    @objc private func firstMenuItemSelected(_ item: NSMenuItem) {
        isUrgent = !isUrgent
    }
    
    @objc private func quit(_ item: NSMenuItem) {
        exit(0)
    }
    
    @objc private func fetchAndUpdateStatus() {
        let url = "https://canigoyet.teespring.com/state"
        var request = URLRequest(url: URL(string: url)!)
        request.httpMethod = "GET"
        let session = URLSession.shared
        
        session.dataTask(with: request) {data, response, err in
            if let data = data,
            let jsonOptional = try? JSONSerialization.jsonObject(with: data, options: .allowFragments) as? [String: Any],
                let json = jsonOptional,
                let status = json["state"] as? String
            {
                self.status = BathroomStatus(rawValue: status) ?? .unknown
            }
        }.resume()
    }
    
    private var selectedAssetIndex = 0
    @objc private func showCrazyIcon() {
        let assets = ["ex01", "ex02", "ex03", "ex04", "ex05"]
        let asset = assets[selectedAssetIndex % assets.count]
        statusItem.button?.image = NSImage(named: asset)
        selectedAssetIndex += 1
    }
    
    private func updateIcon() {
        guard let image = [ "YES" : "check", "NO" : "ex" ][status.rawValue] else { return }
        statusItem.button?.image = NSImage(named: image)
    }
    
    @objc private func displayNotification() {
        fetchFortune { fortune in
            let notification = NSUserNotification()
            notification.title = "The toilet is available"
            notification.informativeText = "\"\(fortune)\""
            notification.soundName = "Poop.wav"
            NSUserNotificationCenter.default.deliver(notification)
        }
    }
    
    private func fetchFortune(completion: @escaping (String) -> Void) {
        let url = "https://fortunecookieapi.herokuapp.com/v1/cookie"
        var request = URLRequest(url: URL(string: url)!)
        request.httpMethod = "GET"
        let session = URLSession.shared
        
        session.dataTask(with: request) {data, response, err in
            if let data = data,
            let jsonOptional = try? JSONSerialization.jsonObject(with: data, options: .allowFragments) as? [[String: Any]],
                let json = jsonOptional,
                let first = json.first,
                let fortune = first["fortune"] as? [String: Any],
                let message = fortune["message"] as? String
            {
                DispatchQueue.main.async {
                    completion(message)
                }
            }
        }.resume()
    }
        
    
    func menuWillOpen(_ menu: NSMenu) {
        let title = isUrgent ? "😌" : "😳"
        statusItem.menu?.items.first?.title = title
        menu.items.first?.isHidden = status != .occupied
    }
}

